class RestockOrder {
    static ISSUED = "ISSUED";
    static DELIVERY = "DELIVERY";
    static DELIVERED = "DELIVERED";
    static TESTED = "TESTED";
    static COMPLETEDRETURN = "COMPLETEDRETURN";
    static COMPLETED = "COMPLETED";


    constructor(id, issueDate, state, deliveryDate, supplierId, products, skuItems = []) {
        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.deliveryDate = deliveryDate;
        this.supplierId = supplierId;
        this.products = products;
        this.skuItems = skuItems;
    }
}

module.exports = RestockOrder;