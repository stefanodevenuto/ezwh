const RESTOCKORDER_NOT_FOUND_MESSAGE   = "No Restock Order associated to id";
const RESTOCKORDER_NOT_COMPLETEDRETURN = "Restock order is not returned";

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
}

module.exports = { RestockOrderErrorFactory }