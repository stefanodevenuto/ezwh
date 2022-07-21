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
    static mockTestInternalOrder() {
        const internalOrder = new InternalOrder(null, "2022/11/04 05:30", "ISSUED", 
                            [{"SKUId":3138,"description":"a product","price":10.99,"qty":3},
                            {"SKUId":3139,"description":"another product","price":11.99,"qty":3}], 1);
        return internalOrder;
    }

    static mockTestInternalOrder2() {
        const internalOrder = new InternalOrder(null, "2022/11/04 05:30", "ISSUED", 
                            [{"SKUId":3138,"description":"a product","price":10.99,"qty":3},
                            {"SKUId":3139,"description":"another product","price":11.99,"qty":3}], 1);
        return internalOrder;
    }



}


module.exports = InternalOrder;
