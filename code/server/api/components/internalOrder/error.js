const INTERNAL_ORDER_NOT_FOUND_MESSAGE = "The Internal Order is not present";

class InternalOrderErrorFactory {
    static newInternalOrderNotFound() {
        let error = new Error();
		error.customMessage = INTERNAL_ORDER_NOT_FOUND_MESSAGE;
        error.customCode = 404;

		return error;
    }
}

module.exports = { InternalOrderErrorFactory }