const INITIALIZATION_ERROR_MESSAGE = "Internal error: try again later!"
const ITEM_NOT_FOUND_MESSAGE        = "No item associated to id";

class ItemErrorFactory {
    static initializeMapFailed() {  //CHECK
        let error = new Error(INITIALIZATION_ERROR_MESSAGE);
		error.code = 404;

		return error;
    }
    
    static newItemNotFound() {   //CHECK
        let error = new Error(ITEM_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }
}

module.exports = { ItemErrorFactory }