const AppDAO = require("../../../db/AppDAO");

class RestockOrderDAO extends AppDAO{

    constructor() { super(); }
    
    
    async getAllRestockOrders() {
        // PER CREATE: const query_get_item_id = "SELECT id FROM item WHERE SKUId = ? AND supplierId = ?";

        const query = 'SELECT RO.id AS id, RO.issueDate, RO.state, RO.supplierId, RO.deliveryDate, I.SKUId, I.description, I.price, ROI.qty\
            FROM restockOrder RO \
            JOIN restockOrder_item ROI ON RO.id = ROI.restockOrderId \
            JOIN item I ON ROI.itemId = I.id \
            ORDER BY RO.id, I.id';

        // Returns a list containing an element for each Item of each Restock Order
        return await this.all(query);
    }

    async getAllIssuedRestockOrders() {
        const query = 'SELECT RO.id AS id, RO.issueDate, RO.state, RO.supplierId, RO.deliveryDate, I.SKUId, I.description, I.price, ROI.qty\
            FROM restockOrder RO \
            JOIN restockOrder_item ROI ON RO.id = ROI.restockOrderId \
            JOIN item I ON ROI.itemId = I.id \
            WHERE RO.state = "ISSUED" \
            ORDER BY RO.id, I.id';

        // Returns a list containing an element for each Item of each Restock Order
        return await this.all(query);
    }

    async getRestockOrderByID(restockOrderId) {
        const query = 'SELECT RO.id AS id, RO.issueDate, RO.state, RO.supplierId, RO.deliveryDate, I.SKUId, I.description, I.price, ROI.qty\
            FROM restockOrder RO \
            JOIN restockOrder_item ROI ON RO.id = ROI.restockOrderId \
            JOIN item I ON ROI.itemId = I.id \
            WHERE RO.id = ? \
            ORDER BY RO.id';
        
        // Returns a list containing an element for each Item of the Restock Order
        return await this.all(query, [restockOrderId]);
    }

    async createRestockOrder(restockOrder, products) {
        const query_restockOrder = 'INSERT INTO restockOrder(issueDate, state, supplierId) VALUES (?, ?, ?)';
        const query_association = 'INSERT INTO restockOrder_item(itemId, restockOrderId, qty) VALUES (?, ?, ?)';
        
        await this.startTransaction();

        const { id } = await this.run(query_restockOrder, [restockOrder.issueDate, restockOrder.state, restockOrder.supplierId]);

        // Se volessi dire che un Item sta in un ordine solo, si dovrebbe aggiungere restockOrder_item supplierId, in maniera da avere
        // una VERA chiave primaria, e basterebbe poi mettere UNIQUE la coppia
        for (let product of products) {
            console.log(id)
            console.log(product.item.id);
            console.log(product.qty);
            await this.run(query_association, [product.item.id, id, product.qty]);
        }

        await this.commitTransaction();
        return id;
    }

    /*
    async modifyPosition(oldPositionID, newPositionID, position) {
        const query = 'UPDATE position SET positionID = ?, aisleID = ?, row = ?, col = ?, maxWeight = ?, maxVolume = ?, occupiedWeight = ?, occupiedVolume = ? WHERE positionID = ?'

        return await this.run(query, [newPositionID, position.newAisleID, position.newRow, position.newCol, position.newMaxWeight, position.newMaxVolume, position.newOccupiedWeight,
            position.newOccupiedVolume, oldPositionID]);
    }

    async modifyPositionID(oldPositionId, newPositionId, newAisleId, newRow, newCol) {
        const query = 'UPDATE position SET positionID = ?, aisleID = ?, row = ?, col = ? WHERE positionID = ?'
        return await this.run(query, [newPositionId, newAisleId, newRow, newCol, oldPositionId]);
    }

    async deletePosition(positionID) {
        const query = 'DELETE FROM position WHERE positionID = ?'
        return await this.run(query, [positionID]);
    }

    /* Utilities */
    /*async modifyOccupiedFieldsPosition(skuId, totalWeight, totalVolume) {
        const query = "UPDATE position SET occupiedWeight = ?, occupiedVolume = ? WHERE skuId = ?";
        return await this.run(query, [totalWeight, totalVolume, skuId]);
    }*/
}

module.exports = RestockOrderDAO;
