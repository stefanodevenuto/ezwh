const RETURN_ORDER_NOT_FOUND_MESSAGE    = "No Return Order associated to id";

class ReturnOrderErrorFactory {
    static newReturnOrderNotFound() {
        let error = new Error(RETURN_ORDER_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }
}

module.exports = { ReturnOrderErrorFactory }