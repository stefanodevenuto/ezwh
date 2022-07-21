const INTERNAL_ORDER_NOT_FOUND_MESSAGE = "The Internal Order is not present";
const INTERNAL_ORDER_NO_PRODUCTS       = "Products must be not empty to change state in COMPLETED";
const INTERNALORDER_INVALID_DATE = "Invalid date";

class InternalOrderErrorFactory {
    static newInternalOrderNotFound() {
        let error = new Error();
		error.customMessage = INTERNAL_ORDER_NOT_FOUND_MESSAGE;
        error.customCode = 404;

		return error;
    }

    static newRestockOrderDateNotValid() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = INTERNALORDER_INVALID_DATE;

		return error;
    }

    static newInternalOrderWithNoProducts() {
        let error = new Error();
		error.customMessage = INTERNAL_ORDER_NO_PRODUCTS;
        error.customCode = 422;

		return error;
    }
}

module.exports = { InternalOrderErrorFactory }