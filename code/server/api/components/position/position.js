class Position {
    constructor(positionID = `${aisle}${row}${col}`, aisleID, row, col, maxWeight, maxVolume, occupiedWeight = null, occupiedVolume = null) {
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
