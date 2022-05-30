class Item {
    constructor(id = null, description, price, SKUId, supplierId) {
        this.id = id;
        this.description = description;
        this.price = price;
        this.SKUId = SKUId;
        this.supplierId = supplierId;
    }

    static mockItem() {
        const item = new Item(1212, "a test item", 10.20, null, null);
        return item;
    }

}

module.exports = Item;
