const RESTOCKORDER_NOT_FOUND_MESSAGE   = "No Restock Order associated to id";
const RESTOCKORDER_INVALID_DATE = "Invalid date";
const RESTOCKORDER_NOT_COMPLETEDRETURN = "Restock order is not in completed return";
const RESTOCKORDER_NOT_DELIVERED = "Restock order is not delivered yet";
const RESTOCKORDER_NOT_DELIVERY = "Restock order is not in delivery yet";
const RESTOCKORDER_DELIVERY_BEFORE_ISSUE = "The inserted delivery date is before the issue date";

class RestockOrderErrorFactory {
    static newRestockOrderNotFound() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = RESTOCKORDER_NOT_FOUND_MESSAGE;

		return error;
    }
    
    static newRestockOrderNotReturned() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = RESTOCKORDER_NOT_COMPLETEDRETURN;

		return error;
    }

    static newRestockOrderDateNotValid() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = RESTOCKORDER_INVALID_DATE;

		return error;
    }

    static newRestockOrderNotDelivered() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = RESTOCKORDER_NOT_DELIVERED;

		return error;
    }

    static newRestockOrderNotDelivery() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = RESTOCKORDER_NOT_DELIVERY;

		return error;
    }

    static newRestockOrderDeliveryBeforeIssue() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = RESTOCKORDER_DELIVERY_BEFORE_ISSUE;

		return error;
    }
}

module.exports = { RestockOrderErrorFactory }