class InternalOrder {
    static ISSUED = "ISSUED";
    static ACCEPTED = "ACCEPTED";
    static REFUSED = "REFUSED";
    static CANCELED = "CANCELED";
    static COMPLETED = "COMPLETED";

    static STATES = [this.ISSUED, this.ACCEPTED, this.REFUSED, this.CANCELED, this.COMPLETED]

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
