const sqlite3 = require("sqlite3");
const AppDAO = require("../../../db/AppDAO");

class ItemDAO extends AppDAO{    
    async getAllItems() {
        const query = 'SELECT * FROM item';
        return await this.all(query);
    }

    async getItemByID(itemId) {
        const query = 'SELECT * FROM item WHERE id = ?';
        let row = await this.get(query, [itemId]);

        return row;
    }

    async createItem(id, description, price, SKUId, supplierId) {
        const query = 'INSERT INTO item(id, description, price, SKUId, supplierId) VALUES(?, ?, ?, ?, ?)';
        let lastId = await this.run(query, [id, description, price, SKUId, supplierId]);

        return lastId;
    }

    async modifyItem(id, description, price) {
        const query = 'UPDATE item SET description = ?, price = ? WHERE id = ?';
        return await this.run(query, [description, price, id]);
    }

    async deleteItem(id) {
        const query = 'DELETE FROM item WHERE id = ?';
        return await this.run(query, [id]);
    }

    // ###################### Utilities

    async getItemBySkuIdAndSupplierId(skuId, supplierId) {
        const query = "SELECT * FROM item WHERE SKUId = ? AND supplierId = ?";
        return await this.get(query, [skuId, supplierId]);
    }


    // ##################### Test

    async deleteAllItem() {
        const query = 'DELETE FROM item';
        return await this.run(query);
    }
}

module.exports = ItemDAO;
