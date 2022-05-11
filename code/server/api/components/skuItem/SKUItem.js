class SKUItem {
    constructor(RFID, SKUId, available, dateOfStock) {
        this.RFID = RFID;
        this.SKUId = SKUId;
        this.available = available;
        this.dateOfStock = dateOfStock;
    }
}

module.exports = SKUItem;

