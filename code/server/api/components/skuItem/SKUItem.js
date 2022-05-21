class SKUItem {
    constructor(RFID, SKUId, available, dateOfStock, restockOrderId = null) {
        this.RFID = RFID;
        this.SKUId = SKUId;
        this.available = available;
        this.dateOfStock = dateOfStock;
        this.restockOrderId = restockOrderId;
    }

    static mockTestSkuItem() {
        const skuItem = new SKUItem("12341234123412341234123412341234", 2889, 0, "2022/02/02 09:30");
        return skuItem;
    }
}

module.exports = SKUItem;

