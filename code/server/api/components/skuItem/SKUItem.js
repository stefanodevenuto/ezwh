class SKUItem {
    constructor(RFID, SKUId, available, dateOfStock, restockOrderId = null) {
        this.RFID = RFID;
        this.SKUId = SKUId;
        this.available = available;
        this.dateOfStock = dateOfStock;
        this.restockOrderId = restockOrderId;
    }
    static mockTestSkuItem() {
        const skuItem = new SKUItem("12345678912345678912345678912345", 2889, 0, "2022/11/02 05:30")
        return skuItem;        
    }

}

module.exports = SKUItem;

