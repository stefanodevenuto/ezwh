class InternalOrder {
    
    static ISSUED = "ISSUED";
    static DELIVERY = "DELIVERY";
    static DELIVERED = "DELIVERED";
    static TESTED = "TESTED";
    static COMPLETEDRETURN = "COMPLETEDRETURN";
    static COMPLETED = "COMPLETED";

    static STATES = [this.ISSUED, this.DELIVERY, this.DELIVERED, this.TESTED, this.COMPLETEDRETURN, this.COMPLETED]

    constructor(id = null, issueDate, state, products = [], customerId) {
        this.id = id;
        this.issueDate = issueDate,
        this.state = state,
        this.products = products,
        this.customerId = customerId
}

    static isValidState(state) {
        return this.STATES.some((s) => s === state);
    }

    static mockTestInternalOrder() {
        const internalOrder = new InternalOrder(null, "2022/11/04 05:30", this.ISSUED, 
                            [{"SKUId":2889,"description":"a product","price":10.99,"qty":3},
                            {"SKUId":2890,"description":"another product","price":11.99,"qty":3}], 1);
        return internalOrder;
    }
}


module.exports = InternalOrder;
