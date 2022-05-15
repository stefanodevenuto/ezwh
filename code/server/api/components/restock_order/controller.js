const RestockOrderDAO = require('./dao')
const RestockOrder = require("./restockOrder");
const Product = require("./product");
const { RestockOrderErrorFactory } = require('./error');
const { SKUItemErrorFactory } = require('../skuItem/error');
const Cache = require('lru-cache')

class RestockOrderController {
    constructor(testResultController, skuItemController, itemController) {
        this.dao = new RestockOrderDAO();
        this.restockOrderMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
        this.enableCache = (process.env.ENABLE_MAP === "true") || false;
        this.observers = [];

        this.testResultController = testResultController;
        this.skuItemController = skuItemController;
        this.itemController = itemController;
    }

    // ################################ Observer-Observable Pattern
    addObserver(observer) {
        this.observers.push(observer);
    }

    notify(data) {
        if (this.observers.length > 0) {
            this.observers.forEach(observer => observer.update(data));
        }
    }

    update(data) {
        const { action, value } = data;
        
        if (action === "UPDATE_SKUITEM") {
            const { oldRFID, newRFID, restockOrderId } = value;
            
            let restockOrder = this.restockOrderMap.get(restockOrderId);
            if (restockOrder !== undefined) {
                restockOrder.skuItems.map((skuItem) => {
                    if (skuItem.valid === false && skuItem.RFID === oldRFID)
                        skuItem.RFID = newRFID;
                });
            }
        }
    }

    // ################################ API
    async getAllRestockOrders(req, res, next) {
        try {
            const rows = await this.dao.getAllRestockOrders();
            const restockOrders = await this.buildRestockOrders(rows);
            return res.status(200).json(restockOrders);
        } catch (err) {
            return next(err);
        }
    }

    async getAllIssuedRestockOrders(req, res, next) {
        try {
            const rows = await this.dao.getAllIssuedRestockOrders();
            const restockOrders = await this.buildRestockOrders(rows);
            return res.status(200).json(restockOrders);
        } catch (err) {
            return next(err);
        }
    }

    async getRestockOrderByID(req, res, next) {
        try {
            const restockOrderId = Number(req.params.id);
            let restockOrder = await this.getRestockOrderByIDInternal(restockOrderId);
            return res.status(200).json(restockOrder);
        } catch (err) {
            return next(err);
        }
    }

    async getRestockOrderReturnItemsByID(req, res, next) {
        try {
            const restockOrderId = Number(req.params.id);

            let restockOrder;
            if (this.enableCache) {
                const restockOrderMap = this.restockOrderMap.get(restockOrderId);

                if (restockOrderMap !== undefined)
                    restockOrder = restockOrderMap;
            }

            if (restockOrder === undefined) {
                const rows = await this.dao.getRestockOrderByID(restockOrderId);
                if (rows.length === 0)
                    throw RestockOrderErrorFactory.newRestockOrderNotFound();

                const [restockOrderDB] = await this.buildRestockOrders(rows);
                restockOrder = restockOrderDB;
            }

            if (restockOrder.state !== RestockOrder.COMPLETEDRETURN)
                throw RestockOrderErrorFactory.newRestockOrderNotReturned();

            let skuItemsReturned = [];

            for (let skuItem of restockOrder.skuItems) {
                if (await this.testResultController.hasFailedTestResultsByRFID(skuItem.RFID))
                    skuItemsReturned.push(skuItem);
            }

            return res.status(200).json(skuItemsReturned);
        } catch (err) {
            return next(err);
        }
    }

    // 1. Per ogni products (SKUId):
    //  1. Recupero l'itemId (SKUId + supplierId)
    //  2. Inserisco nella tabella associativa (restockOrderId, itemId, qty)
    // 2. Creo restockOrder

    async createRestockOrder(req, res, next) {
        try {
            const rawRestockOrder = req.body;
            const supplierId = rawRestockOrder.supplierId;

            // Multiple utility: get the Item in the cache + check if the Item exists
            let products = [];
            for (let rawItem of rawRestockOrder.products) {
                let item = await this.itemController.getItemBySkuIdAndSupplierId(rawItem.SKUId, supplierId);
                let product = new Product(item, rawItem.qty);
                products.push(product);
            }

            const id = await this.dao.createRestockOrder(rawRestockOrder, RestockOrder.ISSUED, products);

            if (this.enableCache) {
                const restockOrder = new RestockOrder(id, rawRestockOrder.issueDate, RestockOrder.ISSUED,
                    null, rawRestockOrder.supplierId, products);

                this.restockOrderMap.set(Number(restockOrder.id), restockOrder);
            }

            return res.status(201).send();
        } catch (err) {
            return next(err);
        }
    }

    async modifyState(req, res, next) {
        try {
            const restockOrderId = Number(req.params.id);
            const newState = req.body.newState;

            const { changes } = await this.dao.modifyState(restockOrderId, newState);
            if (changes === 0)
                throw RestockOrderErrorFactory.newRestockOrderNotFound();

            if (this.enableCache) {
                let restockOrder = this.restockOrderMap.get(restockOrderId);
                if (restockOrder !== undefined) {
                    restockOrder.state = newState;
                }
            }

            return res.status(200).send();
        } catch (err) {
            return next(err);
        }
    }

    async modifyRestockOrderSkuItems(req, res, next) {
        try {
            const restockOrderId = Number(req.params.id);
            const rawSkuItems = req.body.skuItems;

            let restockOrder = undefined;
            let newSkuItems = [];

            if (this.enableCache) {
                restockOrder = this.restockOrderMap.get(restockOrderId);

                if (restockOrder !== undefined && restockOrder.state !== RestockOrder.DELIVERED)
                    throw RestockOrderErrorFactory.newRestockOrderNotDelivered();
            }

            if (restockOrder === undefined) {
                let restockOrderFromDB = await this.getRestockOrderByIDInternal(restockOrderId);

                if (restockOrderFromDB === undefined)
                    throw RestockOrderErrorFactory.newRestockOrderNotFound();

                if (restockOrderFromDB.state !== RestockOrder.DELIVERED)
                    throw RestockOrderErrorFactory.newRestockOrderNotDelivered();
            }

            for (let rawSkuItem of rawSkuItems) {
                // Multiple utility: get the Sku Item in the cache + check if the Sku Item exists
                let skuItem = await this.skuItemController.getSKUItemByRFIDInternal(rawSkuItem.rfid);

                if (restockOrder !== undefined)
                    newSkuItems.push(skuItem);
            }

            await this.dao.modifyRestockOrderSkuItems(restockOrderId, rawSkuItems);

            if (this.enableCache) {
                if (restockOrder !== undefined)
                    restockOrder.skuItems = [...restockOrder.skuItems, ...newSkuItems];
                this.notify({action: "UPDATE_RESTOCKORDER", value: {restockOrderId: restockOrderId, skuItems: newSkuItems}})
            }

            return res.status(200).send();
        } catch (err) {
            return next(err);
        }
    }

    async modifyTransportNote(req, res, next) {
        try {
            const restockOrderId = Number(req.params.id);
            const deliveryDate = req.body.transportNote.deliveryDate;

            let restockOrder = undefined;
            if (this.enableCache) {
                restockOrder = this.restockOrderMap.get(restockOrderId);

                if (restockOrder !== undefined && restockOrder.state !== RestockOrder.DELIVERY)
                    throw RestockOrderErrorFactory.newRestockOrderNotDelivery();
            }

            if (restockOrder === undefined) {
                let restockOrderFromDB = await this.getRestockOrderByIDInternal(restockOrderId);

                if (restockOrderFromDB === undefined)
                    throw RestockOrderErrorFactory.newRestockOrderNotFound();

                if (restockOrderFromDB.state !== RestockOrder.DELIVERY)
                    throw RestockOrderErrorFactory.newRestockOrderNotDelivery();
            }

            await this.dao.modifyTransportNote(restockOrderId, deliveryDate);

            if (restockOrder !== undefined)
                restockOrder.deliveryDate = deliveryDate;
                
            return res.status(200).send();
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                if (err.message.includes("deliveryDate"))
                    err = RestockOrderErrorFactory.newRestockOrderDeliveryBeforeIssue();
            }

            return next(err);
        }
    }

    async deleteRestockOrder(req, res, next) {
        try {
            const restockOrderId = req.params.id;
            await this.dao.deleteRestockOrder(restockOrderId);

            if (changes === 0)
                throw RestockOrderErrorFactory.newRestockOrderNotFound();

            if (this.enableCache) {
                let restockOrder = this.restockOrderMap.get(restockOrderId);

                if (restockOrder !== undefined) {

                    restockOrder.skuItems.map((skuItem) => {
                        skuItem.restockOrderId = null;
                    })

                    this.restockOrderMap.delete(restockOrderId);
                }

                //this.notify({action: "DELETE_RESTOCKORDER", value: restockOrderId});
            }

            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }

    // ################## Utilities

    async buildRestockOrders(rows) {
        let restockOrders = [];
        if (rows.length > 0) {
            // Setup last as the first restockOrder
            let lastRestockOrder = rows[0];

            let products = [];
            for (let row of rows) {
                // If it's the same restockOrder, continue adding the related Skus
                if (row.id == lastRestockOrder.id) {
                    let item = await this.itemController.getItemBySkuIdAndSupplierId(
                        row.SKUId, lastRestockOrder.supplierId);
                    let product = new Product(item, row.qty);
                    products.push(product);
                } else {
                    // Otherwise, create the current restockOrder and clear the products array
                    const restockOrder = new RestockOrder(lastRestockOrder.id, lastRestockOrder.issueDate, lastRestockOrder.state,
                        lastRestockOrder.deliveryDate, lastRestockOrder.supplierId, products);

                    restockOrder.skuItems = await this.skuItemController.getAllSkuItemsByRestockOrderAndCache(restockOrder.id);
                    restockOrders.push(restockOrder);

                    // Reset
                    lastRestockOrder = row;
                    products = [];

                    // Don't lose the current Item!
                    let item = await this.itemController.getItemBySkuIdAndSupplierId(row.SKUId, lastRestockOrder.supplierId)
                    let product = new Product(item, row.qty);
                    products.push(product);
                }
            }

            // Create the last restockOrder
            const restockOrder = new RestockOrder(lastRestockOrder.id, lastRestockOrder.issueDate, lastRestockOrder.state,
                lastRestockOrder.deliveryDate, lastRestockOrder.supplierId, products);

            restockOrder.skuItems = await this.skuItemController.getAllSkuItemsByRestockOrderAndCache(restockOrder.id);
            restockOrders.push(restockOrder);
        }

        return restockOrders;
    }

    async getRestockOrderByIDInternal(restockOrderId) {
        if (this.enableCache) {
            const restockOrder = this.restockOrderMap.get(restockOrderId);

            if (restockOrder !== undefined) {

                // Check if all valid Items
                for (let product of restockOrder.products) {
                    if (product.item.valid === false)
                        product.item = await this.itemController.getItemByIDInternal(product.item.id);
                }

                // Check if all valid Sku Items
                for (let skuItem of restockOrder.skuItems) {
                    if (skuItem.valid === false)
                        skuItem = await this.skuItemController.getSKUItemByRFIDInternal(skuItem.RFID);
                }

                return restockOrder;
            }
        }

        const rows = await this.dao.getRestockOrderByID(restockOrderId);
        if (rows.length === 0)
            throw RestockOrderErrorFactory.newRestockOrderNotFound();

        const [restockOrder] = await this.buildRestockOrders(rows);

        if (this.enableCache)
            this.restockOrderMap.set(restockOrder.id, restockOrder)

        return restockOrder;
    }
}

module.exports = RestockOrderController;