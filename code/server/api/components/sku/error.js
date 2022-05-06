const INITIALIZATION_ERROR_MESSAGE = "Internal error: try again later!"
const SKU_NOT_FOUND_MESSAGE        = "No SKU associated to id";
const POSITION_NOT_CAPABLE_MESSAGE = "Position not capable enough to hold newAvailableQuantity";

class SkuErrorFactory {
    static initializeMapFailed() {
        let error = new Error(INITIALIZATION_ERROR_MESSAGE);
		error.code = 404;

		return error;
    }
    
    static newSkuNotFound() {
        let error = new Error(SKU_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }

    static newPositionNotCapable() {
        let error = new Error(POSITION_NOT_CAPABLE_MESSAGE);
		error.code = 422;

		return error;
    }
}

module.exports = { SkuErrorFactory }