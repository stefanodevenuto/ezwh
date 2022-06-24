const ReturnOrderDAO = require('./dao')
const ReturnOrder = require("./returnOrder");
const Products = require('./products');
const { ReturnOrderErrorFactory } = require('./error');
const dayjs = require('dayjs');

class ReturnOrderController {
    constructor(skuItemController) {
        this.dao = new ReturnOrderDAO();
        this.skuItemController = skuItemController;
    }

    // ################################ API

    async getAllReturnOrders() {
        const rows = await this.dao.getAllReturnOrders();
        const returnOrders = await this.buildReturnOrders(rows);

        return returnOrders;
    }

    async getReturnOrderByID(returnOrderID) {
        const rows = await this.dao.getReturnOrderByID(returnOrderID);
        if (rows.length === 0)
            throw ReturnOrderErrorFactory.newReturnOrderNotFound();

        const [returnOrder] = await this.buildReturnOrders(rows);
        return returnOrder;
    }

    async createReturnOrder(returnDate, products, restockOrderId) {
        if (!dayjs(returnDate).isValid())
            throw ReturnOrderErrorFactory.newReturnOrderDateNotValid();

        let totalProducts = [];
        for (let row of products) {
            // Check if RestockOrder and SKUItem exist
            let item = await this.skuItemController.getItemByRFIDInternal(row.RFID, restockOrderId);
            if (item === undefined) {
                await this.skuItemController.createSKUItem(row.RFID, row.SKUId, dayjs().format());
                item = await this.skuItemController.getItemByRFIDInternal(row.RFID, restockOrderId);
            }

            let product = new Products(item.SKUId, item.description, item.price, row.RFID);
            totalProducts.push(product);            
        }

        await this.dao.createReturnOrder(returnDate, restockOrderId, totalProducts);
    }

    async deleteReturnOrder(returnOrderID) {
        await this.dao.deleteReturnOrder(returnOrderID);
    }

    // ################## Utilities

    async buildReturnOrders(rows) {
        let returnOrders = [];
        if (rows.length > 0) {
            // Setup last as the first restockOrder
            let lastReturnOrder = rows[0];

            let products = [];
            for (let row of rows) {
                // If it's the same restockOrder, continue adding the related Skus
                if (row.id == lastReturnOrder.id) {
                    let item = await this.skuItemController.getItemByRFIDInternal(row.RFID, lastReturnOrder.restockOrderId);
                    products.push({
                        RFID: row.RFID,
                        SKUId: item.SKUId,
                        itemId: item.itemId,
                        description: item.description,
                        price: item.price
                    });
                } else {
                    // Otherwise, create the current restockOrder and clear the products array
                    const returnOrder = new ReturnOrder(lastReturnOrder.id, lastReturnOrder.returnDate, products, lastReturnOrder.restockOrderId);
                    returnOrders.push(returnOrder);

                    // Reset
                    lastReturnOrder = row;
                    products = [];

                    // Don't lose the current Sku Item!
                    let item = await this.skuItemController.getItemByRFIDInternal(row.RFID, lastReturnOrder.restockOrderId);
                    products.push({
                        RFID: row.RFID,
                        SKUId: item.SKUId,
                        itemId: item.itemId,
                        description: item.description,
                        price: item.price
                    });
                }
            }

            // Create the last restockOrder
            const returnOrder = new ReturnOrder(lastReturnOrder.id, lastReturnOrder.returnDate, products, lastReturnOrder.restockOrderId);
            returnOrders.push(returnOrder);
        }

        return returnOrders;
    }
}

module.exports = ReturnOrderController;