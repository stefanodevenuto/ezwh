const INTERNAL_ORDER_NOT_FOUND_MESSAGE = "The Internal Order is not present";

class InternalOrderErrorFactory {

    static newInternalOrderNotFound() {
        let error = new Error();
        error.customCode = 404;
		error.customMessage = INTERNAL_ORDER_NOT_FOUND_MESSAGE;
        

		return error;
    }
}

module.exports = { InternalOrderErrorFactory }