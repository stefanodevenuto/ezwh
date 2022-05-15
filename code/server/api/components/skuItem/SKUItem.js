class SKUItem {
    constructor(RFID, SKUId, available, dateOfStock, restockOrderId = null) {
        this.RFID = RFID;
        this.SKUId = SKUId;
        this.available = available;
        this.dateOfStock = dateOfStock;
        this.restockOrderId = restockOrderId;

        this.valid = true;
    }
}

module.exports = SKUItem;

