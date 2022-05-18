const RestockOrderDAO = require('./dao')
const RestockOrder = require("./restockOrder");
const Product = require("./product");
const { RestockOrderErrorFactory } = require('./error');
const { SKUItemErrorFactory } = require('../skuItem/error');
const Cache = require('lru-cache')

class RestockOrderController {
    constructor(testResultController, skuItemController, itemController) {
        this.dao = new RestockOrderDAO();
        this.testResultController = testResultController;
        this.skuItemController = skuItemController;
        this.itemController = itemController;
    }

    // ################################ API

    async getAllRestockOrders(req, res, next) {
        try {
            const rows = await this.dao.getAllRestockOrders();
            const restockOrders = await this.buildRestockOrders(rows);
            return res.status(200).json(restockOrders.map((p) => p.intoJson()));
        } catch (err) {
            return next(err);
        }
    }

    async getAllIssuedRestockOrders(req, res, next) {
        try {
            const rows = await this.dao.getAllIssuedRestockOrders();
            const restockOrders = await this.buildRestockOrders(rows);
            return res.status(200).json(restockOrders.map((p) => p.intoJson()));
        } catch (err) {
            return next(err);
        }
    }

    async getRestockOrderByID(req, res, next) {
        try {
            const restockOrderId = Number(req.params.id);
            let restockOrder = await this.getRestockOrderByIDInternal(restockOrderId);
            return res.status(200).json(restockOrder.intoJson());
        } catch (err) {
            return next(err);
        }
    }

    async getRestockOrderReturnItemsByID(req, res, next) {
        try {
            const restockOrderId = Number(req.params.id);

            const rows = await this.dao.getRestockOrderByID(restockOrderId);
            if (rows.length === 0)
                throw RestockOrderErrorFactory.newRestockOrderNotFound();

            const [restockOrder] = await this.buildRestockOrders(rows);
            if (restockOrder.state !== RestockOrder.COMPLETEDRETURN)
                throw RestockOrderErrorFactory.newRestockOrderNotReturned();

            let skuItemsReturned = [];
            for (let skuItem of restockOrder.skuItems) {
                if (await this.testResultController.hasFailedTestResultsByRFID(skuItem.RFID))
                    skuItemsReturned.push(skuItem);
            }

            return res.status(200).json(skuItemsReturned.map((s) => {
                return {
                    rfid: s.RFID,
                    SKUId: s.SKUId
                }
            }));
        } catch (err) {
            return next(err);
        }
    }

    async createRestockOrder(req, res, next) {
        try {
            const rawRestockOrder = req.body;
            const supplierId = rawRestockOrder.supplierId;

            let products = [];
            for (let rawItem of rawRestockOrder.products) {
                let item = await this.itemController.getItemBySkuIdAndSupplierId(rawItem.SKUId, supplierId);
                let product = new Product(item, rawItem.qty);
                products.push(product);
            }

            await this.dao.createRestockOrder(rawRestockOrder, RestockOrder.ISSUED, products);
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

            return res.status(200).send();
        } catch (err) {
            return next(err);
        }
    }

    async modifyRestockOrderSkuItems(req, res, next) {
        try {
            const restockOrderId = Number(req.params.id);
            const rawSkuItems = req.body.skuItems;

            let restockOrder = await this.getRestockOrderByIDInternal(restockOrderId);

            if (restockOrder === undefined)
                throw RestockOrderErrorFactory.newRestockOrderNotFound();

            if (restockOrder.state !== RestockOrder.DELIVERED)
                throw RestockOrderErrorFactory.newRestockOrderNotDelivered();

            const totalChanges = await this.dao.modifyRestockOrderSkuItems(restockOrderId, rawSkuItems);
            if (totalChanges !== rawSkuItems.length)
                throw SKUItemErrorFactory.newSKUItemNotFound();

            return res.status(200).send();
        } catch (err) {
            return next(err);
        }
    }

    async modifyTransportNote(req, res, next) {
        try {
            const restockOrderId = Number(req.params.id);
            const deliveryDate = req.body.transportNote.deliveryDate;

            let restockOrder = await this.getRestockOrderByIDInternal(restockOrderId);

            if (restockOrder === undefined)
                throw RestockOrderErrorFactory.newRestockOrderNotFound();

            if (restockOrder.state !== RestockOrder.DELIVERY)
                throw RestockOrderErrorFactory.newRestockOrderNotDelivery();

            await this.dao.modifyTransportNote(restockOrderId, deliveryDate);
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

                    restockOrder.skuItems = await this.skuItemController.getAllSkuItemsByRestockOrder(restockOrder.id);
                    restockOrders.push(restockOrder);

                    // Reset
                    lastRestockOrder = row;
                    products = [];

                    // Don't lose the current product!
                    let item = await this.itemController.getItemBySkuIdAndSupplierId(row.SKUId, lastRestockOrder.supplierId)
                    let product = new Product(item, row.qty);
                    products.push(product);
                }
            }

            // Create the last restockOrder
            const restockOrder = new RestockOrder(lastRestockOrder.id, lastRestockOrder.issueDate, lastRestockOrder.state,
                lastRestockOrder.deliveryDate, lastRestockOrder.supplierId, products);

            restockOrder.skuItems = await this.skuItemController.getAllSkuItemsByRestockOrder(restockOrder.id);
            restockOrders.push(restockOrder);
        }

        return restockOrders;
    }

    async getRestockOrderByIDInternal(restockOrderId) {
        const rows = await this.dao.getRestockOrderByID(restockOrderId);
        if (rows.length === 0)
            throw RestockOrderErrorFactory.newRestockOrderNotFound();

        const [restockOrder] = await this.buildRestockOrders(rows);
        return restockOrder;
    }
}

module.exports = RestockOrderController;