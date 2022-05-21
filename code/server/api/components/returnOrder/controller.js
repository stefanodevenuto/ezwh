const ReturnOrderDAO = require('./dao')
const ReturnOrder = require("./returnOrder");
const SkuDAO = require('../sku/dao');
const SkuController = require('../sku/controller')
const Products = require('./products');
const { ReturnOrderErrorFactory } = require('./error');

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
        let totalProducts = [];
        for (let row of products) {
            // Check if RestockOrder and SKUItem exist
            let result = await this.skuItemController.getItemByRFIDInternal(row.RFID, restockOrderId);
            let product = new Products(result.SKUId, result.description, result.price, row.RFID);
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
                    let product = await this.skuItemController.getSKUItemByRFIDInternal(row.RFID);
                    products.push(product);
                } else {
                    // Otherwise, create the current restockOrder and clear the products array
                    const returnOrder = new ReturnOrder(lastReturnOrder.id, lastReturnOrder.returnDate, products, lastReturnOrder.restockOrderId);
                    returnOrders.push(returnOrder);

                    // Reset
                    lastReturnOrder = row;
                    products = [];

                    // Don't lose the current Item!
                    let product = await this.skuItemController.getSKUItemByRFIDInternal(row.RFID);
                    products.push(product);
                }
            }

            // Create the last restockOrder
            const returnOrder = new ReturnOrder(lastReturnOrder.id, lastReturnOrder.returnDate, products, lastReturnOrder.restockOrderId);

            //returnOrder.skuItems = await this.skuItemController.getAllSkuItemsByRestockOrderAndCache(restockOrder.id);
            returnOrders.push(returnOrder);
        }

        return returnOrders;
    }
}

module.exports = ReturnOrderController;