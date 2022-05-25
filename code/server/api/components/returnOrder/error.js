const RETURN_ORDER_NOT_FOUND_MESSAGE    = "No Return Order associated to id";

class ReturnOrderErrorFactory {
    static newReturnOrderNotFound() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = RETURN_ORDER_NOT_FOUND_MESSAGE;

		return error;
    }
}

module.exports = { ReturnOrderErrorFactory }