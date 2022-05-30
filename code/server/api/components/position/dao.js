const AppDAO = require("../../../db/AppDAO");

class PositionDAO extends AppDAO{    
    async getAllPositions() {
        const query = 'SELECT positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume FROM position';
        return await this.all(query);
    }

    async getPositionByID(positionID) {
        const query = 'SELECT positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume FROM position WHERE positionID = ?';
        let row = await this.get(query, [positionID]);

        return row;
    }

    async createPosition(positionID, aisleID, row, col, maxWeight, maxVolume) {
        const query = 'INSERT INTO position(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, \
            occupiedVolume) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        let lastId = await this.run(query, [positionID, aisleID, row, col, maxWeight, maxVolume, 0, 0]);
        return lastId;
    }

    async modifyPosition(newPositionId, newAisleID, newRow, newCol, newMaxWeight,
        newMaxVolume, newOccupiedWeight, newOccupiedVolume, positionID) {

        const query = 'UPDATE position SET positionID = ?, aisleID = ?, row = ?, col = ?, maxWeight = ?, maxVolume = ?, occupiedWeight = ?, occupiedVolume = ? WHERE positionID = ?'

        return await this.run(query, [newPositionId, newAisleID, newRow, newCol, newMaxWeight, 
            newMaxVolume, newOccupiedWeight, newOccupiedVolume, positionID]);
    }

    async modifyPositionID(oldPositionId, newPositionId, newAisleId, newRow, newCol) {
        const query = 'UPDATE position SET positionID = ?, aisleID = ?, row = ?, col = ? WHERE positionID = ?'
        return await this.run(query, [newPositionId, newAisleId, newRow, newCol, oldPositionId]);
    }

    async deletePosition(positionID) {
        const query = 'DELETE FROM position WHERE positionID = ?'
        return await this.run(query, [positionID]);
    }

    // ################## Test 

    async deleteAllPosition() {
        const query = 'DELETE FROM position'
        return await this.run(query);
    }
}

module.exports = PositionDAO;
