const sqlite3 = require("sqlite3");
const AppDAO = require("../../../db/AppDAO");

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
        const query = 'SELECT * FROM skuItem WHERE SKUId = ? AND Available = ?';
        let row = await this.get(query, [SKUId, 1]);

        return row;
    }

    async createSKUItem(SKUItem) {
        const query = 'INSERT INTO skuItem(RFID, SKUId, Available, DateOfStock, returnOrderId, restockOrderId, internalOrderId) VALUES (?, ?, ?, ?, ?, ?,?)'
        let lastId = await this.run(query, [SKUItem.RFID, SKUItem.SKUId, 0, SKUItem.dateOfStock, undefined, undefined, undefined]);
        
        return lastId;
    }


    async modifySKUItem(RFID, SKUItem) {
        console.log("A" + SKUItem.newRFID, SKUItem.newSKUId, SKUItem.newAvailable,
            SKUItem.newDateOfStock, RFID);
        const query = 'UPDATE skuItem SET RFID = ?, available = ?, dateOfStock = ? WHERE RFID = ?'
        await this.run(query, [SKUItem.newRFID, SKUItem.newAvailable,
            SKUItem.newDateOfStock, RFID]);
    }


    async deleteSKUItem(RFID) {
        const query = 'DELETE FROM skuItem WHERE RFID = ?'
        await this.run(query, [RFID]);
    }
}

module.exports = SKUItemDAO;
