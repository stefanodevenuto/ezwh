const AppDAO = require("../../../db/AppDAO.js");

class SKUItemDAO extends AppDAO{    
    async getAllSKUItems() {
        const query = 'SELECT * FROM skuItem';
        return await this.all(query);
    }

    async getSKUItemByRFID(RFID) {
        const query = 'SELECT * FROM skuItem WHERE RFID = ?';
        let row = await this.get(query, [RFID]);

        return row;
    }

    async getSKUItemBySKUID(SKUId) {
        const query = 'SELECT RFID, skuId, dateOfStock FROM skuItem WHERE skuId = ? AND available = ?';
        return await this.all(query, [SKUId, 1]);
    }

    async createSKUItem(RFID, SKUId, DateOfStock) {
        const query = 'INSERT INTO skuItem(RFID, SKUId, Available, DateOfStock) VALUES (?, ?, ?, ?)'
        let lastId = await this.run(query, [RFID, SKUId, 0, DateOfStock]);
        
        return lastId;
    }

    async modifySKUItem(RFID, newRFID, newAvailable, newDateOfStock) {
        const query = 'UPDATE skuItem SET RFID = ?, available = ?, dateOfStock = ? WHERE RFID = ?'
        return await this.run(query, [newRFID, newAvailable, newDateOfStock, RFID]);
    }

    async deleteSKUItem(RFID) {
        const query = 'DELETE FROM skuItem WHERE RFID = ?'
        return await this.run(query, [RFID]);
    }

    async deleteAllSKUItem() {
        const query = 'DELETE FROM skuItem'
        return await this.run(query);
    }


    // #################### Utilities

    async getAllSkuItemsByRestockOrder(restockOrderId) {
        const query = "SELECT RFID FROM skuItem WHERE restockOrderId = ?";
        return await this.all(query, [restockOrderId]);
    }

    async getSupplierIdByRestockOrderId(restockOrderId) {
        const query = "SELECT supplierId FROM restockOrder RO WHERE RO.id = ?";
        return await this.get(query, [restockOrderId]);
    }

    async getSkuByRFIDInternal(rfid) {
        const query = 'SELECT S.id AS SKUId, S.description, S.price\
            FROM skuItem SI \
            JOIN sku S ON S.id = SI.SKUId \
            WHERE SI.RFID = ? ';

        return await this.get(query, [rfid]);
    }
}

module.exports = SKUItemDAO;
