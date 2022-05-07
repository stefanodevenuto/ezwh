const AppDAO = require("../../../db/AppDAO");

class SkuDAO extends AppDAO{

    constructor() { super(); }
    
    async getAllSkus() {
        const query = 'SELECT * FROM sku';
        return await this.all(query);
    }

    async getSkuByID(skuId) {
        const query = 'SELECT * FROM sku WHERE id = ?';
        let row = await this.get(query, [skuId]);

        return row;
    }

    async createSku(sku) {
        const query = 'INSERT INTO sku(description, weight, volume, notes, price, availableQuantity) VALUES (?, ?, ?, ?, ?, ?)'
        let lastId = await this.run(query, [sku.description, sku.weight, sku.volume, sku.notes, sku.price, sku.availableQuantity]);
        
        return lastId;
    }

    async modifySku(skuId, sku) {
        const query = 'UPDATE sku SET description = ?, weight = ?, volume = ?, notes = ?, price = ?, availableQuantity = ? WHERE id = ?'
        await this.run(query, [sku.newDescription, sku.newWeight, sku.newVolume, sku.newNotes, sku.newPrice, sku.newAvailableQuantity, skuId]);
    }

    async addModifySkuPosition(skuId, newPosition) {
        const query = 'UPDATE sku SET position = ? WHERE id = ?'
        await this.run(query, [newPosition, skuId]);
    }

    async deleteSku(skuId) {
        const query = 'DELETE FROM sku WHERE id = ?'
        await this.run(query, [skuId]);
    }
}

module.exports = SkuDAO;
