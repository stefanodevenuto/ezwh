class InternalOrder {
    
    static ISSUED = "ISSUED";
    static DELIVERY = "DELIVERY";
    static DELIVERED = "DELIVERED";
    static TESTED = "TESTED";
    static COMPLETEDRETURN = "COMPLETEDRETURN";
    static COMPLETED = "COMPLETED";

    static STATES = [this.ISSUED, this.DELIVERY, this.DELIVERED, this.TESTED, this.COMPLETEDRETURN, this.COMPLETED]

    constructor(id = null, issueDate, state, products, customerId) {
        this.id = id;
        this.issueDate = issueDate,
        this.state = state,
        this.products = products,
        this.customerId = customerId
}

    static isValidState(state) {
        return this.STATES.some((s) => s === state);
    }
}


module.exports = InternalOrder;
