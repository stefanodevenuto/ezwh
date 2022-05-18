const InternalOrderDAO = require('./dao')
const InternalOrder = require("./internalOrder");
const SkuDAO = require('../sku/dao');
const SkuController = require('../sku/controller')
const Products = require('./products');
const ProductsQ = require('./productsQ.js');
const { InternalOrderErrorFactory } = require('./error');
const Cache = require('lru-cache')

class InternalOrderController {
    constructor() {
        this.dao = new InternalOrderDAO();
        this.sku = new SkuDAO();
        this.SkuController = new SkuController();
    }
    
    async buildInternalOrders(rows) {
        let internalOrders = [];
        let product;
        if (rows.length > 0) {
            // Setup last as the first restockOrder
            let lastInternalOrder = rows[0];

            let products = [];
            
            for (let row of rows) {
                // If it's the same restockOrder, continue adding the related Skus
                if (row.id == lastInternalOrder.id) {
                    if(row.state !== "COMPLETED"){
                    //let item = new Item(row.SKUId, row.description, row.price);
                        product = new ProductsQ(row.SKUId, row.description, row.price, row.qty);
                    } else {
                        product = new Products(row.SKUId, row.description, row.price, row.RFID);
                    }
                    products.push(product);
                } else {
                    // Otherwise, create the current restockOrder and clear the products array
                    const internalOrder = new InternalOrder(lastInternalOrder.id, lastInternalOrder.issueDate, lastInternalOrder.state, products, lastInternalOrder.customerId);

                    //InternalOrder.skuItems = await this.skuItemController.getAllSkuItemsByRestockOrderAndCache(InternalOrder.id);
                    internalOrders.push(internalOrder);

                    // Reset
                    lastInternalOrder = row;
                    products = [];

                    // Don't lose the current Item!
                    if(row.state !== "COMPLETED"){
                        //let item = new Item(row.SKUId, row.description, row.price);
                            product = new ProductsQ(row.SKUId, row.description, row.price, row.qty);
                        } else {
                            product = new Products(row.SKUId, row.description, row.price, row.RFID);
                        }
                    products.push(product);
                }
            }

            // Create the last restockOrder
            const internalOrder = new InternalOrder(lastInternalOrder.id, lastInternalOrder.issueDate, lastInternalOrder.state, products, lastInternalOrder.customerId);

            //InternalOrder.skuItems = await this.skuItemController.getAllSkuItemsByRestockOrderAndCache(restockOrder.id);
            internalOrders.push(internalOrder);
        }

        return internalOrders;
    }

    async getInternalOrderByIDInternal(internalOrderId) {

        const rows = await this.dao.getInternalOrderByID(internalOrderId);
        if (rows.length === 0)
            throw InternalOrderErrorFactory.newRestockOrderNotFound();

        const [internalOrder] = await this.buildInternalOrders(rows);

        return internalOrder;
    }


    // ################################ API
    async getAllInternalOrders(req, res, next) {
        try {
            const rows = await this.dao.getAllInternalOrders();

            const output = await this.buildInternalOrders(rows);

            return res.status(200).json(output);
        } catch (err) {
            return next(err);
        }
    }

    async getInternalOrdersIssued(req, res, next) {
        try {
            const rows = await this.dao.getInternalOrdersIssued();

            const output = await this.buildInternalOrders(rows); 

            return res.status(200).json(output);
        } catch (err) {
            return next(err);
        }
    }

    async getInternalOrdersAccepted(req, res, next) {
        try {
            const rows = await this.dao.getInternalOrdersAccepted();

            const output = await this.buildInternalOrders(rows); 

            return res.status(200).json(output);
        } catch (err) {
            return next(err);
        }
    }

    async getInternalOrderByID(req, res, next) {
        try {
            const internalOrderID = Number(req.params.id);

            let internalOrder = await this.getInternalOrderByIDInternal(internalOrderID);

            if (internalOrder === undefined)
                throw PositionErrorFactory.newPositionNotFound();
    

            return res.status(200).json(internalOrder);
        } catch (err) {
            return next(err);
        }
    }


    async createInternalOrder(req, res, next) {
        try {
            const rawInternalOrder = req.body;

            let rawProducts = req.body.products;
            rawProducts = rawProducts.map(record => new ProductsQ(record.SKUId, record.description,
                record.price, record.qty));

            
            for(let row of rawProducts){
               let sku = await this.sku.getSkuByID(row.SKUId);
               if(sku === -1){
                   return res.status(404).send();
               }
            }
            
            await this.dao.createInternalnOrder(rawInternalOrder, rawProducts);


            return res.status(201).send();
        } catch (err) {
            return next(err);
        }
    }

    


    async modifyStateInternalOrder(req, res, next) {
        try {
            const internalOrderId = req.params.id;
            const rawInternalOrder = req.body;
           

            const { changes } = await this.dao.modifyStateInternalOrder(internalOrderId, rawInternalOrder);

          
            return res.status(200).send();
        } catch (err) {
            
            return next(err);
        }
    }

    async deleteInternalOrder(req, res, next) {
        try {
            const internalOrderID = req.params.id;
            await this.dao.deleteInternalOrder(internalOrderID);

            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = InternalOrderController;