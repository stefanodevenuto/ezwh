const INITIALIZATION_ERROR_MESSAGE = "Internal error: try again later!"
const SKU_NOT_FOUND_MESSAGE        = "No SKU associated to id"; // CHECK
const POSITION_NOT_CAPABLE_MESSAGE = "Position not capable enough to hold newAvailableQuantity";

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