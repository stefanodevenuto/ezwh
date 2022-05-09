class Position {
    constructor(positionID = `${aisleID}${row}${col}`, aisleID, row, col, maxWeight, maxVolume, occupiedWeight = 0, occupiedVolume = 0) {
        this.positionID = positionID;
        this.aisleID = aisleID;
        this.row = row;
        this.col = col;
        this.maxWeight = maxWeight;
        this.maxVolume = maxVolume;
        this.occupiedWeight = occupiedWeight;
        this.occupiedVolume = occupiedVolume;
    }
}

module.exports = Position;
