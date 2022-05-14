class RestockOrder {
    static ISSUED = "ISSUED";
    static DELIVERY = "DELIVERY";
    static DELIVERED = "DELIVERED";
    static TESTED = "TESTED";
    static COMPLETEDRETURN = "COMPLETEDRETURN";
    static COMPLETED = "COMPLETED";

    static STATES = [this.ISSUED, this.DELIVERY, this.DELIVERED, this.TESTED, this.COMPLETEDRETURN, this.COMPLETED]

    constructor(id, issueDate, state, deliveryDate, supplierId, products, skuItems = []) {
        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.deliveryDate = deliveryDate;
        this.supplierId = supplierId;
        this.products = products;
        this.skuItems = skuItems;
    }

    static isValidState(state) {
        return this.STATES.some((s) => s === state);
    }
}

module.exports = RestockOrder;