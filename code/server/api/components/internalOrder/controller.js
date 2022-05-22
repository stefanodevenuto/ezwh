const InternalOrderDAO = require('./dao')
const InternalOrder = require("./internalOrder");
const Products = require('./products');
const ProductsQ = require('./productsQ.js');
const SkuController = require('../sku/controller');
const { InternalOrderErrorFactory } = require('./error');
const { UserErrorFactory } = require('../user/error');
const { SKUItemErrorFactory } = require('../skuItem/error');

class InternalOrderController {
    constructor() {
        this.dao = new InternalOrderDAO();
        this.skuController = new SkuController();
    }

    // ################################ API

    async getAllInternalOrders() {
        const rows = await this.dao.getAllInternalOrders();
        const internalOrders = await this.buildInternalOrders(rows);

        return internalOrders;
    }

    async getInternalOrdersAccepted() {
        const rows = await this.dao.getInternalOrdersAccepted();
        const acceptedInternalOrders = await this.buildInternalOrders(rows);

        return acceptedInternalOrders;
    }

    async getInternalOrdersIssued() {
        const rows = await this.dao.getInternalOrdersIssued();
        const issuedInternalOrders = await this.buildInternalOrders(rows);

        return issuedInternalOrders;
    }

    async getInternalOrderByID(internalOrderID) {
        const internalOrder = await this.getInternalOrderByIDInternal(internalOrderID);
        const internalOrderBuild = await this.buildInternalOrders(internalOrder);
        return internalOrderBuild;
    }


    async createInternalOrder(issueDate, products, customerId) {
        try {
            let finalProducts = [];
            for (let row of products) {
                // Check if Sku exist and recover information
                let sku = await this.skuController.getSkuByIDInternal(row.SKUId);
                let product = new ProductsQ(sku.id, sku.description, sku.price, row.qty)
                finalProducts.push(product);
            }

            await this.dao.createInternalOrder(issueDate, customerId, InternalOrder.ISSUED, finalProducts);
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                if (err.message.includes("FOREIGN"))
                    err = UserErrorFactory.newCustomerNotFound();
            }

            throw err;
        }
    }

    async modifyStateInternalOrder(internalOrderId, newState, products) {
        let finalChanges = 0;
        if (newState === InternalOrder.COMPLETED) {
            const changes = await this.dao.modifyStateInternalOrder(internalOrderId,
                InternalOrder.COMPLETED, products);
            finalChanges = changes;
        } else {
            const changes = await this.dao.modifyStateInternalOrder(internalOrderId, newState);
            finalChanges = changes;
        }

        if (finalChanges === 0)
            throw InternalOrderErrorFactory.newInternalOrderNotFound();

        if (finalChanges === 1)
            throw SKUItemErrorFactory.newSKUItemNotFound();
    }

    async deleteInternalOrder(internalOrderID) {
        await this.dao.deleteInternalOrder(internalOrderID);
    }

    // ################ Utilities

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
                    if (row.state !== "COMPLETED") {
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
                    if (row.state !== "COMPLETED") {
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
            throw InternalOrderErrorFactory.newInternalOrderNotFound();

        const internalOrder = await this.buildInternalOrders(rows);
        return internalOrder;
    }
}

module.exports = InternalOrderController;