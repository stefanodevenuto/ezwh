class Product {
    constructor(item, qty) {
        this.item = item;
        this.qty = qty;
    }

    intoJson() {
        return JSON.parse(this);
    }
}

module.exports = Product;