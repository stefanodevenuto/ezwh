class Item {    // COMPLETED
    constructor(id = null, description, price, SKUId, supplierId) {
        this.id = id;
        this.description = description;
        this.price = price;
        this.SKUId = SKUId;
        this.supplierId = supplierId;

        this.valid = true;
    }
}

module.exports = Item;
