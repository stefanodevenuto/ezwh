const RESTOCKORDER_NOT_FOUND_MESSAGE   = "No Restock Order associated to id";
const RESTOCKORDER_NOT_COMPLETEDRETURN = "Restock order is not in completed return";
const RESTOCKORDER_NOT_DELIVERED = "Restock order is not delivered yet";
const RESTOCKORDER_NOT_DELIVERY = "Restock order is not in delivery yet";
const RESTOCKORDER_DELIVERY_BEFORE_ISSUE = "The inserted delivery date is before the issue date";

class RestockOrderErrorFactory {
    static newRestockOrderNotFound() {
        let error = new Error(RESTOCKORDER_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }
    
    static newRestockOrderNotReturned() {
        let error = new Error(RESTOCKORDER_NOT_COMPLETEDRETURN);
		error.code = 422;

		return error;
    }

    static newRestockOrderNotDelivered() {
        let error = new Error(RESTOCKORDER_NOT_DELIVERED);
		error.code = 422;

		return error;
    }

    static newRestockOrderNotDelivery() {
        let error = new Error(RESTOCKORDER_NOT_DELIVERY);
		error.code = 422;

		return error;
    }

    static newRestockOrderDeliveryBeforeIssue() {
        let error = new Error(RESTOCKORDER_DELIVERY_BEFORE_ISSUE);
		error.code = 422;

		return error;
    }
}

module.exports = { RestockOrderErrorFactory }