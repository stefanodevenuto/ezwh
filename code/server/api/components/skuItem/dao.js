const sqlite3 = require("sqlite3");
const AppDAO = require("../../../db/AppDAO.js");

class SKUItemDAO extends AppDAO{

    constructor() { super(); }
    
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
        const query = 'SELECT * FROM skuItem WHERE skuId = ? AND available = ?';
        return await this.all(query, [SKUId, 1]);
    }

    async createSKUItem(SKUItem) {
        const query = 'INSERT INTO skuItem(RFID, SKUId, Available, DateOfStock) VALUES (?, ?, 0, ?)'
        let lastId = await this.run(query, [SKUItem.RFID, SKUItem.SKUId, SKUItem.DateOfStock]);
        
        return lastId;
    }

    async modifySKUItem(RFID, SKUItem) {
        const query = 'UPDATE skuItem SET RFID = ?, available = ?, dateOfStock = ? WHERE RFID = ?'
        return await this.run(query, [SKUItem.newRFID, SKUItem.newAvailable,
            SKUItem.newDateOfStock, RFID]);
    }


    async deleteSKUItem(RFID) {
        const query = 'DELETE FROM skuItem WHERE RFID = ?'
        return await this.run(query, [RFID]);
    }
}

module.exports = SKUItemDAO;
