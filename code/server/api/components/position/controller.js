const PositionDAO = require('./dao')
const Position = require("./position");
const { PositionErrorFactory } = require('./error');

class PositionController {
    constructor() {
        this.dao = new PositionDAO();
    }

    // ################################ API

    async getAllPositions(req, res, next) {
        try {
            const rows = await this.dao.getAllPositions();
            const positions = rows.map(record => new Position(record.positionID, record.aisleID, record.row,
                record.col, record.maxWeight, record.maxVolume, record.occupiedWeight, record.occupiedVolume, record.skuId));
            return res.status(200).json(positions);
        } catch (err) {
            return next(err);
        }
    }

    async getPositionByID(req, res, next) {
        try {
            const positionID = req.params.id;

            const row = await this.dao.getPositionByID(positionID);
            if (row === undefined)
                throw PositionErrorFactory.newPositionNotFound();
    
            const position = new Position(row.positionID, row.aisleID, row.row,
                row.col, row.maxWeight, row.maxVolume, row.occupiedWeight, row.occupiedVolume)
         
            return res.status(200).json(position);
        } catch (err) {
            return next(err);
        }
    }

    async createPosition(req, res, next) {
        try {
            const rawPosition = req.body;

            if (rawPosition.positionID !== `${rawPosition.aisleID}${rawPosition.row}${rawPosition.col}`)
                throw PositionErrorFactory.newPositionIdNotSymmetric();

            await this.dao.createPosition(rawPosition);

            return res.status(201).send();
        } catch (err) {
            return next(err);
        }
    }

    async modifyPosition(req, res, next) {
        try {
            const positionID = req.params.positionID;
            const rawPosition = req.body;

            const newPositionId = `${rawPosition.newAisleID}${rawPosition.newRow}${rawPosition.newCol}`;
            const { changes } = await this.dao.modifyPosition(positionID, newPositionId, rawPosition);

            if (changes === 0)
                throw PositionErrorFactory.newPositionNotFound();

            return res.status(200).send();
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT")
                err = PositionErrorFactory.newPositionIDNotUnique();

            return next(err);
        }
    }

    async modifyPositionID(req, res, next) {
        try {
            const oldPositionId = req.params.positionID;
            const newPositionId = req.body.newPositionID;

            const splitted = newPositionId.match(/.{1,4}/g);
            const newAisleID = splitted[0];
            const newRow = splitted[1];
            const newCol = splitted[2];

            const { changes } = await this.dao.modifyPositionID(oldPositionId, newPositionId, newAisleID, newRow, newCol);
            if (changes === 0)
                throw PositionErrorFactory.newPositionNotFound();

            return res.status(200).send();
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT")
                err = PositionErrorFactory.newPositionIDNotUnique();

            return next(err);
        }
    }

    async deletePosition(req, res, next) {
        try {
            const positionID = req.params.positionID;
            
            const { changes } = await this.dao.deletePosition(positionID);
            if (changes === 0)
                throw PositionErrorFactory.newPositionNotFound();

            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = PositionController;