const { raw } = require("express");
const AppDAO = require("../../../db/AppDAO");

class InternalOrderDAO extends AppDAO{

    constructor() { super(); }
    
    async getAllInternalOrders() {
        const query = 'SELECT internalOrder.id, issueDate, state, item.SKUId,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_item ON internalOrder.id = internalOrder_item.internalOrderId \
        JOIN item ON internalOrder_item.itemId = item.id\
        LEFT JOIN SKUItem ON item.SKUId = SKUItem.SKUId\
        GROUP BY internalOrder.id, item.SKUId, RFID';
        return await this.all(query);
    }


    async getInternalOrderByID(internalOrderID) {

        const query = 'SELECT internalOrder.id, issueDate, state, item.SKUId,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_item ON internalOrder.id = internalOrder_item.internalOrderId \
        JOIN item ON internalOrder_item.itemId = item.id\
        LEFT JOIN SKUItem ON item.SKUId = SKUItem.SKUId\
        WHERE internalOrder.id = ?';
        
        let rows = await this.all(query, [internalOrderID]);

        return rows;
    }


    async getInternalOrdersAccepted() {

        const query = 'SELECT internalOrder.id, issueDate, state, item.SKUId,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_item ON internalOrder.id = internalOrder_item.internalOrderId \
        JOIN item ON internalOrder_item.itemId = item.id\
        LEFT JOIN SKUItem ON item.SKUId = SKUItem.SKUId\
        WHERE internalOrder.state = ?';
        
        let rows = await this.all(query, ["ACCEPTED"]);

        return rows;
    }

    async getInternalOrdersIssued() {

        const query = 'SELECT internalOrder.id, issueDate, state, item.SKUId,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_item ON internalOrder.id = internalOrder_item.internalOrderId \
        JOIN item ON internalOrder_item.itemId = item.id\
        LEFT JOIN SKUItem ON item.SKUId = SKUItem.SKUId\
        WHERE internalOrder.state = ?';
        
        let rows = await this.all(query, ["ISSUED"]);

        return rows;
    }


    async createInternalnOrder(internalOrder, products) {
        const query = 'INSERT INTO internalOrder(issueDate, customerId) VALUES (?, ?)';
        const queryItem = 'INSERT INTO internalOrder_item(internalOrderId, itemId, qty) VALUES (?, ?, ?)';
        let lastId = await this.run(query, [internalOrder.issueDate, internalOrder.customerId]);

        for(let row of products){
            await this.run(queryItem, [lastId.id, row.SKUId, row.qty]);
        }
        return lastId;
    }



    // Ha senso creare una tabella anzichè solo internalOrder_item
    // internalOrder_skuitem
    // perché dice che se lo stato è completato 
    // vuole questo body da inserire
    // {
    //    "newState":"COMPLETED",
    //    "products":[{"SkuID":1,"RFID":"12345678901234567890123456789016"},{"SkuID":1,"RFID":"12345678901234567890123456789038"},...]
    // }
    // quindi e quindi nella tabella internalOrder_skuitem
    // salvare solo il rfid dal quale poi è possibile accedere allo skuid
    async modifyStateInternalOrder(internalOrderId, rawInternalOrder) {
        
        const query = 'UPDATE internalOrder SET state = ? WHERE id = ?'
        return await this.run(query, [rawInternalOrder.newState, internalOrderId]);
    }



    async deleteInternalOrder(internalOrderID) {
        const query = 'DELETE FROM internalOrder WHERE id = ?'
        return await this.run(query, [internalOrderID]);
    }

    /* Utilities */
    /*async modifyOccupiedFieldsPosition(skuId, totalWeight, totalVolume) {
        const query = "UPDATE position SET occupiedWeight = ?, occupiedVolume = ? WHERE skuId = ?";
        return await this.run(query, [totalWeight, totalVolume, skuId]);
    }*/
}

module.exports = InternalOrderDAO;
