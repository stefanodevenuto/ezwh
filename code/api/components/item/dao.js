const sqlite3 = require("sqlite3");
const AppDAO = require("../../../db/AppDAO");

class ItemDAO extends AppDAO{    
    async getAllItems() {
        const query = 'SELECT * FROM item';
        return await this.all(query);
    }

    async getItemByItemIdAndSupplierId(itemId, supplierId) {
        const query = "SELECT * FROM item WHERE id = ? AND supplierId = ?";
        return await this.get(query, [itemId, supplierId]);
    }

    async createItem(id, description, price, SKUId, supplierId) {
        const query = 'INSERT INTO item(id, description, price, SKUId, supplierId) VALUES(?, ?, ?, ?, ?)';
        let lastId = await this.run(query, [id, description, price, SKUId, supplierId]);

        return lastId;
    }

    async modifyItem(id, supplierId, description, price) {
        const query = 'UPDATE item SET description = ?, price = ? WHERE id = ? AND supplierId = ?';
        return await this.run(query, [description, price, id, supplierId]);
    }

    async deleteItem(id, supplierId) {
        const query = 'DELETE FROM item WHERE id = ? AND supplierId = ?';
        return await this.run(query, [id, supplierId]);
    }

    // ##################### Test

    async deleteAllItem() {
        const query = 'DELETE FROM item';
        return await this.run(query);
    }
}

module.exports = ItemDAO;
