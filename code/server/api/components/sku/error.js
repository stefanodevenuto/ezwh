const SKU_NOT_FOUND_MESSAGE        = "No SKU associated to id";
const POSITION_NOT_CAPABLE_MESSAGE = "Position not capable enough to hold newAvailableQuantity";
const POSITION_ALREADY_OCCUPIED    = "Position already assigned to another SKU";
const SKU_WITH_SKUITEMS            = "The selected Sku is related to some Sku Items";

class SkuErrorFactory {
    static newSkuNotFound() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = SKU_NOT_FOUND_MESSAGE;

		return error;
    }

    static newPositionNotCapable() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = POSITION_NOT_CAPABLE_MESSAGE;

		return error;
    }

    static newPositionAlreadyOccupied() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = POSITION_ALREADY_OCCUPIED;

		return error;
    }

    static newSkuWithAssociatedSkuItems() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = SKU_WITH_SKUITEMS;

		return error;
    }
}

module.exports = { SkuErrorFactory }