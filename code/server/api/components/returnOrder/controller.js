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

    // ################################ API
    async getAllReturnOrders(req, res, next) {
        try {
            const rows = await this.dao.getAllReturnOrders();
            const output = await this.buildReturnOrders(rows);
            
            return res.status(200).json(output);
        } catch (err) {
            return next(err);
        }
    }

    async getReturnOrderByID(req, res, next) {
        try {
            const returnOrderID = req.params.id;

            const rows = await this.dao.getReturnOrderByID(returnOrderID);
            if (rows.length === 0)
                throw ReturnOrderErrorFactory.newReturnOrderNotFound();

            const output = await this.buildReturnOrders(rows);
            return res.status(200).json(output);
        } catch (err) {
            return next(err);
        }
    }


    async createReturnOrder(req, res, next) {
        try {
            const rawReturnOrder = req.body;
            const restockOrderId = rawReturnOrder.restockOrderId;
            
            let products = [];
            for (let row of rawReturnOrder.products) {
                // Check if RestockOrder and SKUItem exist
                let result = await this.skuItemController.getItemByRFIDInternal(row.RFID, restockOrderId);
                let product = new Products(result.SKUId, result.description, result.price, row.RFID);
                products.push(product);
            }
            
            await this.dao.createReturnOrder(rawReturnOrder, products);
            return res.status(201).send();
        } catch (err) {
            return next(err);
        }
    }
    

    async deleteReturnOrder(req, res, next) {
        try {
            const returnOrderID = req.params.id;
            await this.dao.deleteReturnOrder(returnOrderID);
            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = ReturnOrderController;