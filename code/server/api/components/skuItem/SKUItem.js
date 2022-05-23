class SKUItem {
<<<<<<< HEAD
=======
    static OUT_1 = 1;
    static OUT_2 = 2;
    static OUT_3 = 3;

>>>>>>> FabTest
    constructor(RFID, SKUId, available, dateOfStock, restockOrderId = null, returnOrderId = null, internalOrderId = null) {
        this.RFID = RFID;
        this.SKUId = SKUId;
        this.available = available;
        this.dateOfStock = dateOfStock;
        this.restockOrderId = restockOrderId;
        this.returnOrderId = returnOrderId;
        this.internalOrderId = internalOrderId;
<<<<<<< HEAD
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
=======
>>>>>>> FabTest
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
        const skuItem = new SKUItem("12345678912345678912345678912345", 2889, 0, "2022/11/02 05:30")
        return skuItem;        
    }


}

module.exports = SKUItem;

