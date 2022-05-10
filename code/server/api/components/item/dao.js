const sqlite3 = require("sqlite3");
const AppDAO = require("../../../db/AppDAO");   //check

class ItemDAO extends AppDAO{

    constructor() { super(); }
    
    async getAllItems() {
        const query = 'SELECT * FROM item';
        return await this.all(query);
    }

    async getItemByID(itemId) {
        const query = 'SELECT * FROM item WHERE id = ?';
        let row = await this.get(query, [itemId]);

        return row;
    }

    async createItem(item) {
        const query = 'INSERT INTO item(description, price, SKUId, supplierId) VALUES(?, ?, ?, ?)';
        let lastId = await this.run(query, [item.description, item.price, item.SKUId, item.supplierId]);

        return lastId;
    }

    async modifyItem(itemId, item) {
        const query = 'UPDATE item SET description = ?, price = ? WHERE id = ?';
        await this.run(query, [item.newDescription, item.newPrice, itemId]);
    }

    async deleteItem(itemId) {
        const query = 'DELETE FROM item WHERE id = ?';
        await this.run(query, [itemId]);
    }
}

module.exports = ItemDAO;
