const AppDAO = require("../../../db/AppDAO");

class ReturnOrderDAO extends AppDAO{

    constructor() { super(); }
    
    async getAllReturnOrders() {
        const query = 'SELECT returnOrder.id, returnDate, returnOrder.restockOrderId, qty, \
        description, item.SKUId, price, RFID\
        FROM returnOrder\
        JOIN restockOrder_item ON returnOrder.restockOrderId = restockOrder_item.restockOrderId \
        JOIN item ON restockOrder_item.itemId = item.id\
        LEFT JOIN SKUItem ON item.SKUId = SKUItem.SKUId\
        GROUP BY returnOrder.id, item.SKUId, RFID';
        return await this.all(query);
    }

    async getReturnOrderByID(returnOrderID) {

        const query = 'SELECT returnOrder.id, returnDate, returnOrder.restockOrderId, qty, \
        description, item.SKUId, price, RFID\
        FROM returnOrder\
        JOIN restockOrder_item ON returnOrder.restockOrderId = restockOrder_item.restockOrderId \
        JOIN item ON restockOrder_item.itemId = item.id\
        LEFT JOIN SKUItem ON item.SKUId = SKUItem.SKUId\
        WHERE returnOrder.id = ?';
        
        let rows = await this.all(query, [returnOrderID]);

        return rows;
    }

    // come tengo traccia dei products che creo?

    async createReturnOrder(returnOrder) {
        const query = 'INSERT INTO returnOrder(returnDate, restockOrderId) VALUES (?, ?)';
        let lastId = await this.run(query, [returnOrder.returnDate, returnOrder.restockOrderId]);
        
        return lastId;
    }

    async deleteReturnOrder(returnOrderID) {
        const query = 'DELETE FROM returnOrder WHERE id = ?'
        return await this.run(query, [returnOrderID]);
    }

    /* Utilities */
    /*async modifyOccupiedFieldsPosition(skuId, totalWeight, totalVolume) {
        const query = "UPDATE position SET occupiedWeight = ?, occupiedVolume = ? WHERE skuId = ?";
        return await this.run(query, [totalWeight, totalVolume, skuId]);
    }*/
}

module.exports = ReturnOrderDAO;
