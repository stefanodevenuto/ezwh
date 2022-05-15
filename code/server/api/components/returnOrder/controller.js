const ReturnOrderDAO = require('./dao')
const ReturnOrder = require("./returnOrder");
const SkuDAO = require('../sku/dao');
const SkuController = require('../sku/controller')
const Products = require('./products');
const { ReturnOrderErrorFactory } = require('./error');


class ReturnOrderController {
    constructor() {
        this.dao = new ReturnOrderDAO();
        this.sku = new SkuDAO();
        this.SkuController = new SkuController();
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
                    //let item = new Item(row.SKUId, row.description, row.price);
                    let product = new Products(row.SKUId, row.description, row.price, row.RFID);
                    products.push(product);
                } else {
                    // Otherwise, create the current restockOrder and clear the products array
                    const returnOrder = new ReturnOrder(lastReturnOrder.id, lastReturnOrder.returnDate, products, lastReturnOrder.restockOrderId);

                    //returnOrder.skuItems = await this.skuItemController.getAllSkuItemsByRestockOrderAndCache(returnOrder.id);
                    returnOrders.push(returnOrder);

                    // Reset
                    lastReturnOrder = row;
                    products = [];

                    // Don't lose the current Item!
                    let product = new Products(row.SKUId, row.description, row.price, row.RFID);
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

            const output = await this.buildReturnOrders(rows);
        
            if (rows === undefined)
                throw PositionErrorFactory.newPositionNotFound();

            return res.status(200).json(output);
        } catch (err) {
            return next(err);
        }
    }


    async createReturnOrder(req, res, next) {
        try {
            const rawReturnOrder = req.body;
            
            let rawProducts = req.body.products;
            rawProducts = rawProducts.map(record => new Products(record.SKUId, record.description,
                record.price, record.RFID));

            for(let row of rawProducts){
               console.log(row.SKUId);
               let id = await this.sku.getSkuByID(row.SKUId);
               console.log(id);
               if(id === undefined){
                   return res.status(404).send();
               }
            }
            

            await this.dao.createReturnOrder(rawReturnOrder);

            return res.status(201).send();
        } catch (err) {
            return next(err);
        }
    }
    

    async deleteReturnOrder(req, res, next) {
        try {
            const returnOrderID = req.params.id;
            const { changes } = await this.dao.deleteReturnOrder(returnOrderID);


            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = ReturnOrderController;