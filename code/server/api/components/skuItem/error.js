const INITIALIZATION_ERROR_MESSAGE = "Internal error: try again later!"
const SKUITEM_NOT_FOUND_MESSAGE        = "No SKUItem associated to id";
const RFID_NOT_UNIQUE                  = "The inserted RFID is already taken";


class SKUItemErrorFactory {
    static initializeMapFailed() {
        let error = new Error(INITIALIZATION_ERROR_MESSAGE);
		error.code = 404;

		return error;
    }
    
    static newSKUItemNotFound() {
        let error = new Error(SKUITEM_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }

    static newSKUItemRFIDNotUnique() {
        let error = new Error(RFID_NOT_UNIQUE);
		error.code = 404;

		return error;
    }

}

module.exports = { SKUItemErrorFactory }