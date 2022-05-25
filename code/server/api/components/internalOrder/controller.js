const InternalOrderDAO = require('./dao')
const InternalOrder = require("./internalOrder");
const { InternalOrderErrorFactory } = require('./error');
const { UserErrorFactory } = require('../user/error');
const { SKUItemErrorFactory } = require('../skuItem/error');

class InternalOrderController {
    constructor(skuController) {
        this.dao = new InternalOrderDAO();
        this.skuController = skuController;
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
        const [internalOrder] = await this.getInternalOrderByIDInternal(internalOrderID);
        return internalOrder;
    }

    async createInternalOrder(issueDate, products, customerId) {
        if (!dayjs(issueDate).isValid())
            throw InternalOrderErrorFactory.newRestockOrderDateNotValid();

        try {
            let finalProducts = [];
            for (let row of products) {

                // Check if Sku exist and recover information
                let sku = await this.skuController.getSkuByIDInternal(row.SKUId);
                let product = {
                    SKUId : sku.id,
                    description : sku.description,
                    price : sku.price,
                    qty : row.qty
                }
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
        // Check if exists
        await this.getInternalOrderByID(internalOrderId);

        if (newState === InternalOrder.COMPLETED) {
            if (products === undefined)
                throw InternalOrderErrorFactory.newInternalOrderWithNoProducts();

            const changes = await this.dao.modifyStateInternalOrder(internalOrderId,
                InternalOrder.COMPLETED, products);

            if (changes < products.length)
                throw SKUItemErrorFactory.newSKUItemNotFound();
        } else {
            await this.dao.modifyStateInternalOrder(internalOrderId, newState);
        }
    }

    async deleteInternalOrder(internalOrderID) {
        await this.dao.deleteInternalOrder(internalOrderID);
    }

    // ################ Utilities

    async buildInternalOrders(rows) {
        let internalOrders = [];
        let product;
        if (rows.length > 0) {
            // Setup last as the first internalOrder
            let lastInternalOrder = rows[0];

            let products = [];

            for (let row of rows) {
                // If it's the same internalOrder, continue adding the related Skus
                if (row.id == lastInternalOrder.id) {
                    if (row.state !== "COMPLETED") {
                        product = {
                            SKUId : row.SKUId,
                            description : row.description,
                            price : row.price,
                            qty : row.qty
                        }

                    } else {
                        product = {
                            SKUId : row.SKUId,
                            description : row.description,
                            price : row.price,
                            RFID : row.RFID
                        }
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

                    // Don't lose the current Sku!
                    if (row.state !== "COMPLETED") {
                        product = {
                            SKUId : row.SKUId,
                            description : row.description,
                            price : row.price,
                            qty : row.qty
                        }
    
                    } else {
                        product = {
                            SKUId : row.SKUId,
                            description : row.description,
                            price : row.price,
                            qty : row.qty
                        } 
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