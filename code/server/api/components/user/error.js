// TODO

const INITIALIZATION_ERROR_MESSAGE = "Internal error: try again later!"
const SKUITEM_NOT_FOUND_MESSAGE        = "No SKUItem associated to id";
const POSITION_NOT_CAPABLE_MESSAGE = "Position not capable enough to hold newAvailableQuantity";

class SKUItemErrorFactory {
    static initializeMapFailed() {
        let error = new Error(INITIALIZATION_ERROR_MESSAGE);
		error.customCode = 404;

		return error;
    }
    
    static newSKUItemNotFound() {
        let error = new Error(SKUITEM_NOT_FOUND_MESSAGE);
		error.customCode = 404;

		return error;
    }

    static newPositionNotCapable() {
        let error = new Error(POSITION_NOT_CAPABLE_MESSAGE);
		error.customCode = 422;

		return error;
    }
}

module.exports = { SKUItemErrorFactory }