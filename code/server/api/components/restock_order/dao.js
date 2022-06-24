const AppDAO = require("../../../db/AppDAO");

class RestockOrderDAO extends AppDAO{        
    async getAllRestockOrders() {
        const query = 'SELECT RO.id AS id, RO.issueDate, RO.state, RO.supplierId, RO.deliveryDate, I.id AS itemId, I.SKUId, I.description, I.price, ROI.qty\
            FROM restockOrder RO \
            JOIN restockOrder_item ROI ON RO.id = ROI.restockOrderId \
            JOIN item I ON ROI.itemId = I.id \
            ORDER BY RO.id, I.id';

        // Returns a list containing an element for each Item of each Restock Order
        return await this.all(query);
    }

    async getAllIssuedRestockOrders() {
        const query = 'SELECT RO.id AS id, RO.issueDate, RO.state, RO.supplierId, RO.deliveryDate, I.id AS itemId, I.SKUId, I.description, I.price, ROI.qty\
            FROM restockOrder RO \
            JOIN restockOrder_item ROI ON RO.id = ROI.restockOrderId \
            JOIN item I ON ROI.itemId = I.id \
            WHERE RO.state = "ISSUED" \
            ORDER BY RO.id, I.id';

        // Returns a list containing an element for each Item of each Restock Order
        return await this.all(query);
    }

    async getRestockOrderByID(restockOrderId) {
        const query = 'SELECT RO.id AS id, RO.issueDate, RO.state, RO.supplierId, RO.deliveryDate, I.id AS itemId, I.SKUId, I.description, I.price, ROI.qty\
            FROM restockOrder RO \
            JOIN restockOrder_item ROI ON RO.id = ROI.restockOrderId \
            JOIN item I ON ROI.itemId = I.id \
            WHERE RO.id = ? \
            ORDER BY RO.id';
        
        // Returns a list containing an element for each Item of the Restock Order
        return await this.all(query, [restockOrderId]);
    }

    async createRestockOrder(issueDate, supplierId, state, products) {
        const query_restockOrder = 'INSERT INTO restockOrder(issueDate, state, supplierId) VALUES (?, ?, ?)';
        const query_association = 'INSERT INTO restockOrder_item(itemId, restockOrderId, qty) VALUES (?, ?, ?)';
        
        await this.startTransaction();

        const { id } = await this.run(query_restockOrder, [issueDate, state, supplierId]);

        for (let product of products)
            await this.run(query_association, [product.item.id, id, product.qty]);

        await this.commitTransaction();
        return id;
    }

    async modifyState(restockOrderId, newState) {
        const query = 'UPDATE restockOrder SET state = ? WHERE id = ?'
        return await this.run(query, [newState, restockOrderId]);
    }

    async modifyRestockOrderSkuItems(restockOrderId, skuItems) {
        const query = 'UPDATE skuItem SET restockOrderId = ? WHERE RFID = ?'

        let totalChanges = 0;
        await this.startTransaction();

        for (let skuItem of skuItems) {
            let { changes } = await this.run(query, [restockOrderId, skuItem.rfid])
            totalChanges += changes;
        }

        await this.commitTransaction();
        return {changes: totalChanges};
    }

    async modifyTransportNote(restockOrderId, deliveryDate) {
        const query = 'UPDATE restockOrder SET deliveryDate = ? WHERE id = ?'
        return await this.run(query, [deliveryDate, restockOrderId]);
    }

    async deleteRestockOrder(restockOrderId) {
        const query = 'DELETE FROM restockOrder WHERE id = ?'
        return await this.run(query, [restockOrderId]);
    }

    // ####################### Test

    async deleteAllRestockOrder() {
        const query = 'DELETE FROM restockOrder';
        return await this.run(query);
    }
}

module.exports = RestockOrderDAO;
