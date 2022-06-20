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

    intoJson() {
        let productsToJson = this.products.map((p) => {
            return {
                SKUId: p.item.SKUId,
                itemId: p.item.id,
                description: p.item.description,
                price: p.item.price,
                qty: p.qty
            }
        });

        let skuItemsToJson = this.skuItems.map((s) => {
            return {
                SKUId: s.SKUId,
                rfid: s.RFID
            }
        })

        return {
            id: this.id,
            issueDate: this.issueDate,
            state: this.state,
            products: productsToJson,
            supplierId: this.supplierId,
            transportNote: {
                deliveryDate: this.deliveryDate
            },
            skuItems: skuItemsToJson
        }
    }

    static isValidState(state) {
        return this.STATES.some((s) => s === state);
    }

    static mockRestockOrder() {
        const restockOrder = new RestockOrder(null, "2022-02-02", RestockOrder.ISSUED,
            null, null, [], []);
        return restockOrder;
    }
}

module.exports = RestockOrder;