const AppDAO = require("../../../db/AppDAO");

class ReturnOrderDAO extends AppDAO{    
    async getAllReturnOrders() {
        const query = 'SELECT RO.id, RO.returnDate, I.SKUId, I.description, I.price, SI.RFID, RO.restockOrderId \
            FROM returnOrder RO  \
            JOIN restockOrder_item ROI ON ROI.restockOrderId = RO.restockOrderId \
            JOIN item I ON ROI.itemId = I.id \
            JOIN SKUItem SI ON SI.returnOrderId = RO.id \
            GROUP BY RO.id, SI.RFID \
            ORDER BY RO.id, SI.RFID';

        return await this.all(query);
    }

    async getReturnOrderByID(returnOrderID) {
        const query = 'SELECT RO.id, RO.returnDate, I.SKUId, I.description, I.price, SI.RFID, RO.restockOrderId \
            FROM returnOrder RO  \
            JOIN restockOrder_item ROI ON ROI.restockOrderId = RO.restockOrderId \
            JOIN item I ON ROI.itemId = I.id \
            JOIN SKUItem SI ON SI.returnOrderId = RO.id \
            WHERE RO.id = ? \
            GROUP BY RO.id, SI.RFID \
            ORDER BY RO.id, SI.RFID';
        
        let rows = await this.all(query, [returnOrderID]);

        return rows;
    }


    async createReturnOrder(returnDate, restockOrderId, products) {
        const query = 'INSERT INTO returnOrder(returnDate, restockOrderId) VALUES (?, ?)';
        const query_add_id_skuItem = 'UPDATE skuItem SET returnOrderId = ? WHERE RFID = ?';

        await this.startTransaction();

        let { id } = await this.run(query, [returnDate, restockOrderId]);

        for(let row of products){
            await this.run(query_add_id_skuItem, [id, row.RFID]);
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
