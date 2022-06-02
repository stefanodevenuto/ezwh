const ReturnOrderDAO = require('./dao')
const ReturnOrder = require("./returnOrder");
const Products = require('./products');
const { ReturnOrderErrorFactory } = require('./error');
const dayjs = require('dayjs');

class ReturnOrderController {
    constructor(skuItemController, restockOrderController) {
        this.dao = new ReturnOrderDAO();
        this.skuItemController = skuItemController;
        this.restockOrderController = restockOrderController;
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

        // Check if exists
        await this.restockOrderController.getRestockOrderByIDInternal(restockOrderId);

        let totalProducts = [];
        for (let row of products) {
            // Check if RestockOrder and SKUItem exist
            //let result = await this.skuItemController.getItemByRFIDInternal(row.RFID, restockOrderId);
            let sku = await this.skuItemController.getSkuByRFIDInternal(row.RFID);
            if (sku === undefined) {
                await this.skuItemController.createSKUItem(row.RFID, row.SKUId, dayjs().format());
                sku = await this.skuItemController.getSkuByRFIDInternal(row.RFID);
            }

            let product = new Products(sku.SKUId, sku.description, sku.price, row.RFID);
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
                    //let item = await this.skuItemController.getItemByRFIDInternal(row.RFID, row.restockOrderId);
                    let sku = await this.skuItemController.getSkuByRFIDInternal(row.RFID);
                    products.push({
                        RFID: row.RFID,
                        SKUId: sku.SKUId,
                        description: sku.description,
                        price: sku.price
                    });
                } else {
                    // Otherwise, create the current restockOrder and clear the products array
                    const returnOrder = new ReturnOrder(lastReturnOrder.id, lastReturnOrder.returnDate, products, lastReturnOrder.restockOrderId);
                    returnOrders.push(returnOrder);

                    // Reset
                    lastReturnOrder = row;
                    products = [];

                    // Don't lose the current Sku Item!
                    //let item = await this.skuItemController.getItemByRFIDInternal(row.RFID, row.restockOrderId);
                    let sku = await this.skuItemController.getSkuByRFIDInternal(row.RFID);
                    products.push({
                        RFID: row.RFID,
                        SKUId: sku.SKUId,
                        description: sku.description,
                        price: sku.price
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