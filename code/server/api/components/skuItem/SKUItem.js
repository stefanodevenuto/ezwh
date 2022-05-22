class SKUItem {
    static OUT_1 = 1;
    static OUT_2 = 2;
    static OUT_3 = 3;

    constructor(RFID, SKUId, available, dateOfStock, restockOrderId = null, returnOrderId = null, internalOrderId = null) {
        this.RFID = RFID;
        this.SKUId = SKUId;
        this.available = available;
        this.dateOfStock = dateOfStock;
        this.restockOrderId = restockOrderId;
        this.returnOrderId = returnOrderId;
        this.internalOrderId = internalOrderId;
    }

    intoJson(type = false) {
        let result = {
            RFID: this.RFID,
            SKUId: this.SKUId,
            Available: this.available,
            DateOfStock: this.dateOfStock,
        }

        if (type === true) {
            const { Available, ...single} = result;
            result = single;
        }

        return result;
    }
}

module.exports = SKUItem;

