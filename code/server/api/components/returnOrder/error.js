const RETURN_ORDER_NOT_FOUND_MESSAGE    = "No Return Order associated to id";
const RETURNORDER_INVALID_DATE = "Invalid date";

class ReturnOrderErrorFactory {
    static newReturnOrderNotFound() {
        let error = new Error(RETURN_ORDER_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }

    static newReturnOrderDateNotValid() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = RETURNORDER_INVALID_DATE;

		return error;
    }
}

module.exports = { ReturnOrderErrorFactory }