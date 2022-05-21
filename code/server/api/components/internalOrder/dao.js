const { raw } = require("express");
const AppDAO = require("../../../db/AppDAO");

class InternalOrderDAO extends AppDAO{

    constructor() { super(); }
    
    async getAllInternalOrders() {
        const query = 'SELECT internalOrder.id, issueDate, state, sku.id,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_sku ON internalOrder.id = internalOrder_sku.internalOrderId \
        JOIN sku ON internalOrder_sku.skuId = sku.id\
        LEFT JOIN SKUItem ON sku.id = SKUItem.SKUId\
        GROUP BY internalOrder.id, sku.id, RFID';
        return await this.all(query);
    }


    async getInternalOrderByID(internalOrderID) {

        const query = 'SELECT internalOrder.id, issueDate, state, sku.id,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_sku ON internalOrder.id = internalOrder_sku.internalOrderId \
        JOIN sku ON internalOrder_sku.skuId = sku.id\
        LEFT JOIN SKUItem ON sku.id = SKUItem.SKUId\
        WHERE internalOrder.id = ?';
        
        let rows = await this.get(query, [internalOrderID]);

        return rows;
    }


    async getInternalOrdersAccepted() {

        const query = 'SELECT internalOrder.id, issueDate, state, sku.id,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_sku ON internalOrder.id = internalOrder_sku.internalOrderId \
        JOIN sku ON internalOrder_sku.skuId = sku.id\
        LEFT JOIN SKUItem ON sku.id = SKUItem.SKUId\
        WHERE internalOrder.state = ?';
        
        let rows = await this.all(query, ["ACCEPTED"]);

        return rows;
    }

    async getInternalOrdersIssued() {

        const query = 'SELECT internalOrder.id, issueDate, state, sku.id,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_sku ON internalOrder.id = internalOrder_sku.internalOrderId \
        JOIN sku ON internalOrder_sku.skuId = sku.id\
        LEFT JOIN SKUItem ON sku.id = SKUItem.SKUId\
        WHERE internalOrder.state = ?';
        
        let rows = await this.all(query, ["ISSUED"]);

        return rows;
    }


    async createInternalnOrder(internalOrder, products) {
        const query = 'INSERT INTO internalOrder(issueDate, state, customerId) VALUES (?, ?, ?)';
        const queryItem = 'INSERT INTO internalOrder_sku(internalOrderId, skuId, qty) VALUES (?, ?, ?)';
        let lastId = await this.run(query, [internalOrder.issueDate, "ISSUED", internalOrder.customerId]);

        for(let row of products){
            await this.run(queryItem, [lastId.id, row.SKUId, row.qty]);
        }
        return lastId;
    }

    async modifyStateInternalOrder(internalOrderId, rawInternalOrder) {
        
        const query = 'UPDATE internalOrder SET state = ? WHERE id = ?'

        const query_add_id_skuItem = 'UPDATE skuItem SET internalOrderId = ? WHERE RFID = ?';

        await this.startTransaction();

        let { changes } = await this.run(query, [rawInternalOrder.newState, internalOrderId]);
        if(rawInternalOrder.newState === "COMPLETED"){
            for(let row of rawInternalOrder.products){
                await this.run(query_add_id_skuItem, [internalOrderId, row.RFID]);
            }
        }
        await this.commitTransaction();

        return changes;
    }



    async deleteInternalOrder(internalOrderID) {
        
        const queryPr = 'DELETE FROM internalOrder_sku WHERE internalOrderId = ?'
        await this.run(queryPr, [internalOrderID]);

        const query = 'DELETE FROM internalOrder WHERE id = ?'
        return await this.run(query, [internalOrderID]);

    }

    
}

module.exports = InternalOrderDAO;
