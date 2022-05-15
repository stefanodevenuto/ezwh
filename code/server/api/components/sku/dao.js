const AppDAO = require("../../../db/AppDAO");

class SkuDAO extends AppDAO {

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

    async modifySku(skuId, sku, totalWeight, totalVolume) {
        const query_get_position = 'SELECT positionId FROM sku WHERE id = ?';
        const query_sku = 'UPDATE sku SET description = ?, weight = ?, volume = ?, notes = ?, price = ?, availableQuantity = ? WHERE id = ?';
        const query_position = 'UPDATE position SET occupiedWeight = ?, occupiedVolume = ? WHERE positionId = ?';

        const { positionId } = await this.get(query_get_position, [skuId]);

        return await this.serialize([query_sku, query_position], [
            [sku.newDescription, sku.newWeight, sku.newVolume, sku.newNotes, sku.newPrice, sku.newAvailableQuantity, skuId],
            [totalWeight, totalVolume, positionId]
        ]);
    }

    async addModifySkuPosition(skuId, newPosition) {
        const query_sku = 'UPDATE sku SET positionId = ? WHERE id = ?';
        const query_update_position = "UPDATE position SET occupiedWeight = ?, occupiedVolume = ? WHERE positionId = ?";

        let row = await this.getSkuByID(skuId);
        if (row === undefined)
            return 0;

        const totalWeight = row.availableQuantity * row.weight;
        const totalVolume = row.availableQuantity * row.volume;

        return await this.serialize([query_sku, query_update_position, query_update_position],
            [[newPosition, skuId], [0, 0, row.positionId], [totalWeight, totalVolume, newPosition]]);
    }

    async deleteSku(skuId) {
        const query = 'DELETE FROM sku WHERE id = ?'
        return await this.run(query, [skuId]);
    }
}

module.exports = SkuDAO;
