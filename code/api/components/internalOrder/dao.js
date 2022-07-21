const { raw } = require("express");
const AppDAO = require("../../../db/AppDAO");

class InternalOrderDAO extends AppDAO{
    
    async getAllInternalOrders() {
        const query = 'SELECT internalOrder.id, issueDate, state, sku.id AS SKUId,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_sku ON internalOrder.id = internalOrder_sku.internalOrderId \
        JOIN sku ON internalOrder_sku.skuId = sku.id\
        LEFT JOIN SKUItem ON internalOrder.id = SKUItem.internalOrderId AND sku.id = SKUItem.SKUId\
        GROUP BY internalOrder.id, sku.id, RFID';
        let row = await this.all(query);
        return row;
    }


    async getInternalOrderByID(internalOrderID) {

        const query = 'SELECT internalOrder.id, issueDate, state, sku.id as SKUId,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_sku ON internalOrder.id = internalOrder_sku.internalOrderId \
        JOIN sku ON internalOrder_sku.skuId = sku.id\
        LEFT JOIN SKUItem ON internalOrder.id = SKUItem.internalOrderId AND sku.id = SKUItem.SKUId\
        WHERE internalOrder.id = ?';
       
        let rows = await this.all(query, [internalOrderID]);
        return rows;
    }


    async getInternalOrdersAccepted() {

        const query = 'SELECT internalOrder.id, issueDate, state, sku.id AS SKUId,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_sku ON internalOrder.id = internalOrder_sku.internalOrderId \
        JOIN sku ON internalOrder_sku.skuId = sku.id\
        LEFT JOIN SKUItem ON internalOrder.id = SKUItem.internalOrderId AND sku.id = SKUItem.SKUId\
        WHERE internalOrder.state = ?';
        
        let rows = await this.all(query, ["ACCEPTED"]);

        return rows;
    }

    async getInternalOrdersIssued() {

        const query = 'SELECT internalOrder.id, issueDate, state, sku.id AS SKUId,  \
        description, price, qty, RFID, customerId\
        FROM internalOrder\
        JOIN internalOrder_sku ON internalOrder.id = internalOrder_sku.internalOrderId \
        JOIN sku ON internalOrder_sku.skuId = sku.id\
        LEFT JOIN SKUItem ON internalOrder.id = SKUItem.internalOrderId AND sku.id = SKUItem.SKUId\
        WHERE internalOrder.state = ?';
        
        let rows = await this.all(query, ["ISSUED"]);

        return rows;
    }

    async createInternalOrder(issueDate, customerId, state, products) {
        const query = 'INSERT INTO internalOrder(issueDate, state, customerId) VALUES (?, ?, ?)';
        const queryItem = 'INSERT INTO internalOrder_sku(internalOrderId, skuId, qty) VALUES (?, ?, ?)';

        await this.startTransaction();
        const { id } = await this.run(query, [issueDate, state, customerId]);

        for(let row of products)
            await this.run(queryItem, [id, row.SKUId, row.qty]);

        await this.commitTransaction();
        return id;
    }

    async modifyStateInternalOrder(internalOrderId, newState, products = undefined) {
        const query = 'UPDATE internalOrder SET state = ? WHERE id = ?'
        const query_add_id_skuItem = 'UPDATE skuItem SET internalOrderId = ? WHERE RFID = ?';
        
        let finalChanges = 0;
        await this.startTransaction();
        
        let { changes } = await this.run(query, [newState, internalOrderId]);
        finalChanges += changes;

        if(products !== undefined){
            for(let row of products){
                let { changes } = await this.run(query_add_id_skuItem, [internalOrderId, row.RFID]);
                finalChanges += changes;
            }
           
            if (finalChanges === products.length + 1)
                await this.commitTransaction();
            else
                await this.rollbackTransaction();
        } else {
            await this.commitTransaction();
        }
        
        return finalChanges;
    }

    async deleteInternalOrder(internalOrderID) {
        const query = 'DELETE FROM internalOrder WHERE id = ?'
        return await this.run(query, [internalOrderID]);
    }    

    async deleteAllInternalOrder() {
        const queryS = 'DELETE FROM internalOrder_sku'
        await this.run(queryS);
        const query = 'DELETE FROM internalOrder'
        return await this.run(query);
    }  

}

module.exports = InternalOrderDAO;
