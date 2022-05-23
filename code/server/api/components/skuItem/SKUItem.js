class SKUItem {
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

    static mockTestSkuItem() {
        const skuItem = new SKUItem("12341234123412341234123412341234", 1, 0, "2022-02-02");
        return skuItem;
    }
}

module.exports = SKUItem;

