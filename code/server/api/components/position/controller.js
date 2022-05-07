const PositionDAO = require('./dao')
const Position = require("./position");
const { PositionErrorFactory } = require('./error');
const Cache = require('lru-cache')

class PositionController {
    constructor() {
        this.dao = new PositionDAO();
        this.positionMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
        this.enableCache = (process.env.ENABLE_MAP === "true") || false;
        this.allInCache = false;
    }

    async initMap() {
        const allPositions = await this.dao.getAllPositions()
            .catch(() => { throw PositionErrorFactory.initializeMapFailed() });

        if (this.enableCache && allPositions.length < this.positionMap.max) {
            allPositions.map((position) => this.positionMap.set(position.positionID, position));
            this.allInCache = true;
        }
    }

    async getAllPositions(req, res, next) {
        try {
            if (this.enableCache && this.allInCache) {
                const allPositions = Array.from(this.positionMap.values());
                return res.status(200).json(allPositions);
            }

            const rows = await this.dao.getAllPositions();
            const positions = rows.map(record => new Position(record.positionID, record.aisleID, record.row,
                record.col, record.maxWeight, record.maxVolume, record.occupiedWeight, record.occupiedVolume));

            if (this.enableCache && rows.length < this.positionMap.max) {
                positions.map((position) => this.positionMap.set(position.positionID, position));
                this.allInCache = true;
            }

            return res.status(200).json(positions);
        } catch (err) {
            return next(err);
        }
    }

    async getPositionByID(req, res, next) {
        try {
            const positionID = req.params.id;

            if (this.enableCache) {
                const position = this.positionMap.get(positionID);

                if (position !== undefined)
                    return res.status(200).json(position);
            }

            const row = await this.dao.getPositionByID(positionID);
            if (row === undefined)
                throw PositionErrorFactory.newPositionNotFound();

            const position = new Position(row.positionID, row.aisleID, row.row,
                row.col, row.maxWeight, row.maxVolume, row.occupiedWeight, row.occupiedVolume)

            if (this.enableCache)
                this.positionMap.set(position.positionID, position)

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

            if (this.enableCache) {
                const position = new Position(rawPosition.positionID, rawPosition.aisleID, rawPosition.row,
                    rawPosition.col, rawPosition.maxWeight, rawPosition.maxVolume, rawPosition.occupiedWeight, rawPosition.occupiedVolume)

                this.positionMap.set(position.positionID, position);
            }

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

            if (this.enableCache) {
                let oldPosition = this.positionMap.get(positionID);
                this.positionMap.delete(positionID);

                if (oldPosition !== undefined) {
                    oldPosition.positionID = newPositionId;
                    oldPosition.aisleID = rawPosition.newAisleID;
                    oldPosition.row = rawPosition.newRow;
                    oldPosition.col = rawPosition.newCol;
                    oldPosition.maxWeight = rawPosition.newMaxWeight;
                    oldPosition.maxVolume = rawPosition.newMaxVolume;
                    oldPosition.occupiedWeight = rawPosition.newOccupiedWeight;
                    oldPosition.occupiedVolume = rawPosition.newOccupiedVolume;

                    this.positionMap.set(oldPosition.positionID, oldPosition);
                }
            }

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

            if (this.enableCache) {
                let oldPosition = this.positionMap.get(oldPositionId);
                this.positionMap.delete(oldPositionId);

                if (oldPosition !== undefined) {
                    oldPosition.positionID = newPositionId;
                    oldPosition.aisleID = newAisleID;
                    oldPosition.row = newRow;
                    oldPosition.col = newCol;
                }

                this.positionMap.set(oldPosition.positionID, oldPosition);
            }

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

            if (this.enableCache) {
                this.positionMap.delete(positionID);
            }

            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = PositionController;