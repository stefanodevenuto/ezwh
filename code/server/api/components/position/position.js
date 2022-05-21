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

    static mockTestPosition() {
        const position = new Position(800555324421, 8005, 5532, 4421, 14, 41);
        return position;        
    }
}

module.exports = Position;
