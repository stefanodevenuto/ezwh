const RestockOrderDAO = require('./dao')
const RestockOrder = require("./restockOrder");
const Product = require("./product");
const { RestockOrderErrorFactory } = require('./error');
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
    /*addObserver(observer) {
        this.observers.push(observer);
    }

    notify(data) {
        if (this.observers.length > 0) {
            this.observers.forEach(observer => observer.update(data));
        }
    }

    update(data) {
        const { action, value: sku } = data;
        switch(action) {
            case "UPDATE_QUANTITY": {
                let position = this.positionMap.get(sku.positionId);
                if (position !== undefined) {
                    position.occupiedWeight = sku.availableQuantity * sku.weight;
                    position.occupiedVolume = sku.availableQuantity * sku.volume;
                }
            }
            break;

            case "UPDATE_SKU_ID": {
                let position = this.positionMap.get(newPosition);
                if (position !== undefined)
                    position.skuId = sku.id;
            }
            break;
        }
    }*/

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

            if (this.enableCache) {
                const restockOrder = this.restockOrderMap.get(restockOrderId);

                if (restockOrder !== undefined)
                    return res.status(200).json(restockOrder);
            }

            const rows = await this.dao.getRestockOrderByID(restockOrderId);
            if (rows.length === 0)
                throw RestockOrderErrorFactory.newRestockOrderNotFound();

            const [restockOrder] = await this.buildRestockOrders(rows);

            if (this.enableCache)
                this.restockOrderMap.set(restockOrder.id, restockOrder)

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

            const { id } = await this.dao.createRestockOrder(rawRestockOrder, products);
            
            if (this.enableCache) {
                const restockOrder = new RestockOrder(id, rawRestockOrder.issueDate, RestockOrder.ISSUED,
                    null, rawRestockOrder.supplierId, products);

                this.restockOrderMap.set(restockOrder.id, restockOrder);
            }

            return res.status(201).send();
        } catch (err) {
            return next(err);
        }
    }

    /*
    async modifyPosition(req, res, next) {
        try {
            const positionID = req.params.positionID;
            const rawPosition = req.body;

            const newPositionId = `${rawPosition.newAisleID}${rawPosition.newRow}${rawPosition.newCol}`;
            const { changes } = await this.dao.modifyPosition(positionID, newPositionId, rawPosition);

            if (changes === 0)
                throw PositionErrorFactory.newPositionNotFound();

            if (this.enableCache) {
                let oldPosition = this.positionMap.get(positionID);
                this.positionMap.delete(positionID);

                if (oldPosition !== undefined) {
                    oldPosition.positionID = newPositionId;
                    oldPosition.aisleID = rawPosition.newAisleID;
                    oldPosition.row = rawPosition.newRow;
                    oldPosition.col = rawPosition.newCol;
                    oldPosition.maxWeight = rawPosition.newMaxWeight;
                    oldPosition.maxVolume = rawPosition.newMaxVolume;
                    oldPosition.occupiedWeight = rawPosition.newOccupiedWeight;
                    oldPosition.occupiedVolume = rawPosition.newOccupiedVolume;

                    this.positionMap.set(oldPosition.positionID, oldPosition);
                }
            }

            return res.status(200).send();
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT")
                err = PositionErrorFactory.newPositionIDNotUnique();

            return next(err);
        }
    }

    async modifyPositionID(req, res, next) {
        try {
            const oldPositionId = req.params.positionID;
            const newPositionId = req.body.newPositionID;

            const splitted = newPositionId.match(/.{1,4}/g);
            const newAisleID = splitted[0];
            const newRow = splitted[1];
            const newCol = splitted[2];

            const { changes } = await this.dao.modifyPositionID(oldPositionId, newPositionId, newAisleID, newRow, newCol);

            if (changes === 0)
                throw PositionErrorFactory.newPositionNotFound();

            if (this.enableCache) {
                let oldPosition = this.positionMap.get(oldPositionId);
                this.positionMap.delete(oldPositionId);

                if (oldPosition !== undefined) {
                    oldPosition.positionID = newPositionId;
                    oldPosition.aisleID = newAisleID;
                    oldPosition.row = newRow;
                    oldPosition.col = newCol;
                }

                this.positionMap.set(oldPosition.positionID, oldPosition);
            }

            return res.status(200).send();
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT")
                err = PositionErrorFactory.newPositionIDNotUnique();

            return next(err);
        }
    }

    async deletePosition(req, res, next) {
        try {
            const positionID = req.params.positionID;
            const { changes } = await this.dao.deletePosition(positionID);

            if (changes === 0)
                throw PositionErrorFactory.newPositionNotFound();

            if (this.enableCache) {
                this.positionMap.delete(positionID);
                this.notify({action: "DELETE_POSITION", value: positionID});
            }

            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }*/

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
}

module.exports = RestockOrderController;