const PositionDAO = require('./dao')
const Position = require("./position");
const { PositionErrorFactory } = require('./error');

class PositionController {
    constructor() {
        this.dao = new PositionDAO();
    }

    // ################################ API

    async getAllPositions() {
        const rows = await this.dao.getAllPositions();
        const positions = rows.map(record => new Position(record.positionID, record.aisleID, record.row,
            record.col, record.maxWeight, record.maxVolume, record.occupiedWeight, record.occupiedVolume, record.skuId));
        return positions;
    }

    async getPositionByID(id) {
        const row = await this.dao.getPositionByID(id);
        if (row === undefined)
            throw PositionErrorFactory.newPositionNotFound();

        const position = new Position(row.positionID, row.aisleID, row.row,
            row.col, row.maxWeight, row.maxVolume, row.occupiedWeight, row.occupiedVolume)

        return position;
    }

    async createPosition(positionID, aisleID, row, col, maxWeight, maxVolume) {
        try {
            if (positionID !== `${aisleID}${row}${col}`)
                throw PositionErrorFactory.newPositionIdNotSymmetric();

            await this.dao.createPosition(positionID, aisleID, row, col, maxWeight, maxVolume);
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT")
                err = PositionErrorFactory.newPositionIDNotUnique();

            throw err;
        }
    }

    async modifyPosition(positionID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume,
        newOccupiedWeight, newOccupiedVolume) {

        try {
            const newPositionId = `${newAisleID}${newRow}${newCol}`;
            const { changes } = await this.dao.modifyPosition(newPositionId, newAisleID, newRow, newCol, newMaxWeight,
                newMaxVolume, newOccupiedWeight, newOccupiedVolume, positionID);

            if (changes === 0)
                throw PositionErrorFactory.newPositionNotFound();
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT")
                err = PositionErrorFactory.newPositionIDNotUnique();

            throw err;
        }
    }

    async modifyPositionID(oldPositionId, newPositionId) {
        try {
            const splitted = newPositionId.match(/.{1,4}/g);
            const newAisleID = splitted[0];
            const newRow = splitted[1];
            const newCol = splitted[2];

            const { changes } = await this.dao.modifyPositionID(oldPositionId, newPositionId, newAisleID, newRow, newCol);
            if (changes === 0)
                throw PositionErrorFactory.newPositionNotFound();
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT")
                err = PositionErrorFactory.newPositionIDNotUnique();

            throw err;
        }
    }

    async deletePosition(positionID) {
        await this.dao.deletePosition(positionID);
    }
}

module.exports = PositionController;