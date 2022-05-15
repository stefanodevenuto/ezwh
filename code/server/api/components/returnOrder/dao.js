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


    async createReturnOrder(returnOrder) {
        const query = 'INSERT INTO returnOrder(returnDate, restockOrderId) VALUES (?, ?)';
        const query_add_id_skuItem = 'UPDATE skuItem SET restockOrderId = ?, returnOrderId = ? WHERE RFID = ?';

        await this.startTransaction();

        let { id } = await this.run(query, [returnOrder.returnDate, returnOrder.restockOrderId]);

        for(let row of returnOrder.products){
            await this.run(query_add_id_skuItem, [returnOrder.restockOrderId, id, row.RFID]);
        }

        await this.commitTransaction();


        return id;
    }
    

    async deleteReturnOrder(returnOrderID) {
        const query = 'DELETE FROM returnOrder WHERE id = ?'
        return await this.run(query, [returnOrderID]);
    }

}

module.exports = ReturnOrderDAO;
