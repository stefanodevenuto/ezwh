const AppDAO = require("../../../db/AppDAO");

class SkuDAO extends AppDAO {
    async getAllSkus() {
        const query = 'SELECT * FROM sku';
        return await this.all(query);
    }

    async getSkuByID(skuId) {
        const query = 'SELECT * FROM sku WHERE id = ?';
        let row = await this.get(query, [skuId]);

        return row;
    }

    async createSku(description, weight, volume, notes, price, availableQuantity) {
        const query = 'INSERT INTO sku(description, weight, volume, notes, price, availableQuantity) VALUES (?, ?, ?, ?, ?, ?)'
        let lastId = await this.run(query, [description, weight, volume, notes, price, availableQuantity]);

        return lastId;
    }

    async modifySku(skuId, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity, totalWeight, totalVolume) {
        const query_get_position = 'SELECT positionId FROM sku WHERE id = ?';
        const query_sku = 'UPDATE sku SET description = ?, weight = ?, volume = ?, notes = ?, price = ?, availableQuantity = ? WHERE id = ?';
        const query_position = 'UPDATE position SET occupiedWeight = ?, occupiedVolume = ? WHERE positionID = ?';

        const result = await this.get(query_get_position, [skuId]);
        if (result === undefined || result.positionId === null) {
            return await this.run(query_sku, [
                    newDescription, newWeight, newVolume, newNotes,newPrice, newAvailableQuantity, skuId
                ]);
        } else {
            let totalChanges = 0;

            await this.startTransaction();

            const { changes: changeSku } = await this.run(query_sku, [newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity, skuId]);
            totalChanges += changeSku;

            const { changes: changePos } = await this.run(query_position, [totalWeight, totalVolume, result.positionId]);
            totalChanges += changePos;

            await this.commitTransaction();
            
            return {changes: totalChanges}
        }
    }

    async addModifySkuPosition(skuId, newPosition) {
        const query_sku = 'UPDATE sku SET positionId = ? WHERE id = ?';
        const query_update_position = "UPDATE position SET occupiedWeight = ?, occupiedVolume = ? WHERE positionId = ?";

        let row = await this.getSkuByID(skuId);
        if (row === undefined)
            return {changes: 0};

        const totalWeight = row.availableQuantity * row.weight;
        const totalVolume = row.availableQuantity * row.volume;

        await this.startTransaction();

        const { changes } = await this.run(query_sku, [newPosition, skuId]);
        await this.run(query_update_position, [0, 0, row.positionId]);
        await this.run(query_update_position, [totalWeight, totalVolume, newPosition]);

        await this.commitTransaction();

        return changes;
    }

    async deleteSku(skuId) {
        const query = 'DELETE FROM sku WHERE id = ?'
        return await this.run(query, [skuId]);
    }


    // ####################### Test
    async deleteAllSKU() {
        const query = 'DELETE FROM sku';
        return await this.run(query);
    }

}

module.exports = SkuDAO;
