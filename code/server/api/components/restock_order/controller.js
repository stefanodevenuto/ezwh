const RestockOrderDAO = require('./dao')
const RestockOrder = require("./restockOrder");
const Product = require("./product");
const { RestockOrderErrorFactory } = require('./error');
const { SKUItemErrorFactory } = require('../skuItem/error');
const dayjs = require('dayjs');

class RestockOrderController {
    constructor(testResultController, skuItemController, itemController) {
        this.dao = new RestockOrderDAO();
        this.testResultController = testResultController;
        this.skuItemController = skuItemController;
        this.itemController = itemController;
    }

    // ################################ API

    async getAllRestockOrders(req, res, next) {
        const rows = await this.dao.getAllRestockOrders();
        const restockOrders = await this.buildRestockOrders(rows);

        return restockOrders.map((p) => p.intoJson());
    }

    async getAllIssuedRestockOrders(req, res, next) {
        const rows = await this.dao.getAllIssuedRestockOrders();
        const restockOrders = await this.buildRestockOrders(rows);

        return restockOrders.map((p) => p.intoJson());
    }

    async getRestockOrderByID(restockOrderId) {
        let restockOrder = await this.getRestockOrderByIDInternal(restockOrderId);
        return restockOrder.intoJson();
    }

    async getRestockOrderReturnItemsByID(restockOrderId) {
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

        return skuItemsReturned.map((s) => ({ rfid: s.RFID, SKUId: s.SKUId }));
    }

    async createRestockOrder(issueDate, products, supplierId) {
        if (!dayjs(issueDate).isValid())
            throw RestockOrderErrorFactory.newRestockOrderDateNotValid();

        let totalProducts = [];
        for (let rawItem of products) {
            let item = await this.itemController.getItemByItemIdAndSupplierId(rawItem.itemId, supplierId);
            let product = new Product(item, rawItem.qty);
            totalProducts.push(product);
        }

        await this.dao.createRestockOrder(issueDate, supplierId, RestockOrder.ISSUED, totalProducts);
    }

    async modifyState(restockOrderId, newState) {
        const { changes } = await this.dao.modifyState(restockOrderId, newState);
        if (changes === 0)
            throw RestockOrderErrorFactory.newRestockOrderNotFound();
    }

    async modifyRestockOrderSkuItems(restockOrderId, skuItems) {
        let restockOrder = await this.getRestockOrderByIDInternal(restockOrderId);

        if (restockOrder === undefined)
            throw RestockOrderErrorFactory.newRestockOrderNotFound();

        if (restockOrder.state !== RestockOrder.DELIVERED)
            throw RestockOrderErrorFactory.newRestockOrderNotDelivered();
        
        await this.dao.modifyRestockOrderSkuItems(restockOrderId, skuItems);
    }

    async modifyTransportNote(restockOrderId, deliveryDate) {
        try {
            if (!dayjs(deliveryDate).isValid())
                throw RestockOrderErrorFactory.newRestockOrderDateNotValid();

            let restockOrder = await this.getRestockOrderByIDInternal(restockOrderId);

            if (restockOrder === undefined)
                throw RestockOrderErrorFactory.newRestockOrderNotFound();

            if (restockOrder.state !== RestockOrder.DELIVERY)
                throw RestockOrderErrorFactory.newRestockOrderNotDelivery();

            await this.dao.modifyTransportNote(restockOrderId, deliveryDate);
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                if (err.message.includes("deliveryDate"))
                    err = RestockOrderErrorFactory.newRestockOrderDeliveryBeforeIssue();
            }

            throw err;
        }
    }

    async deleteRestockOrder(restockOrderId) {
        await this.dao.deleteRestockOrder(restockOrderId);
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
                    let item = await this.itemController.getItemByItemIdAndSupplierId(
                        row.itemId, lastRestockOrder.supplierId);

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
                    let item = await this.itemController.getItemByItemIdAndSupplierId(row.itemId, lastRestockOrder.supplierId)
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