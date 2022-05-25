class ReturnOrder {
    constructor(id = null, returnDate, products, restockOrderId) {
        this.id = id;
        this.returnDate = returnDate,
        this.products = products,
        this.restockOrderId = restockOrderId
    }
}

module.exports = ReturnOrder;
