const AppDAO = require("../../../db/AppDAO");

class PositionDAO extends AppDAO{

    constructor() { super(); }
    
    async getAllPositions() {
        const query = 'SELECT positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume FROM position';
        return await this.all(query);
    }

    async getPositionByID(positionID) {
        const query = 'SELECT positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume FROM position WHERE positionID = ?';
        let row = await this.get(query, [positionID]);

        return row;
    }

    async createPosition(position) {
        const query = 'INSERT INTO position(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        let lastId = await this.run(query, [position.positionID, position.aisleID, position.row,
            position.col, position.maxWeight, position.maxVolume, 0, 0]);
        
        return lastId;
    }

    async modifyPosition(oldPositionID, newPositionID, position) {
        const query = 'UPDATE position SET positionID = ?, aisleID = ?, row = ?, col = ?, maxWeight = ?, maxVolume = ?, occupiedWeight = ?, occupiedVolume = ? WHERE positionID = ?'

        return await this.run(query, [newPositionID, position.newAisleID, position.newRow, position.newCol, position.newMaxWeight, position.newMaxVolume, position.newOccupiedWeight,
            position.newOccupiedVolume, oldPositionID]);
    }

    async modifyPositionID(oldPositionId, newPositionId, newAisleId, newRow, newCol) {
        const query = 'UPDATE position SET positionID = ?, aisleID = ?, row = ?, col = ? WHERE positionID = ?'
        return await this.run(query, [newPositionId, newAisleId, newRow, newCol, oldPositionId]);
    }

    async deletePosition(positionID) {
        const query = 'DELETE FROM position WHERE positionID = ?'
        return await this.run(query, [positionID]);
    }

    /* Utilities */
    /*async modifyOccupiedFieldsPosition(skuId, totalWeight, totalVolume) {
        const query = "UPDATE position SET occupiedWeight = ?, occupiedVolume = ? WHERE skuId = ?";
        return await this.run(query, [totalWeight, totalVolume, skuId]);
    }*/
}

module.exports = PositionDAO;
