// GENERIC ERRORS
const INITIALIZATION_ERROR_MESSAGE    = "Internal error: try again later!"    //internal server error
const VALIDATION_OF_ID_FAILED_MESSAGE = "Semantic errors inside id!";         //maybe corrupted DB?
const UNAUTHORIZED_ACCESS_MESSAGE     = "You do not have the necessary permissions!"    
const NOT_LOGGED_IN_MESSAGE           = "You are not logged in!"
// 'GET' ERRORS
const ITEM_NOT_FOUND_MESSAGE = "No item associated to provided id!";           //item not found (while requesting)
// 'POST' ERRORS
const SKU_NOT_FOUND_MESSAGE            = "SKU not found!";  //i.e. there is no SKU with such ID
const BODY_VALIDATION_FAILED_MESSAGE   = "Semantic errors inside body!"; //maybe can change the message...
const SUPPLIER_ALREADY_SELLING_SKU_MESSAGE  = "The supplier is already selling an item with the same SKUId!";
const SUPPLIER_ALREADY_SELLING_ITEM_MESSAGE = "The supplier is already selling an item with this id!";
// 'PUT' ERRORS
        // we can recicle already defined functions!
// 'DELETE' ERRORS
        // we can recicle already defined functions!


class ItemErrorFactory {
    static initializeMapFailed() {  
        let error = new Error(INITIALIZATION_ERROR_MESSAGE);
		error.code = 500;   // changed from 404 to 500

		return error;
    }

    static genericCorruptedData() {
        let error = new Error(VALIDATION_OF_ID_FAILED_MESSAGE);
        return error.code = 422;
    }

    static unauthorizedAccess() {
        let error = new Error(UNAUTHORIZED_ACCESS_MESSAGE);
        return error.code = 401;
    }
    
    static notLoggedIn() {
        let error = new Error(NOT_LOGGED_IN_MESSAGE);
		error.code = 401;

		return error;
    }

    static itemNotFound() {
        let error = new Error(ITEM_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }

    static skuNotFound() {
        let error = new Error(SKU_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }

    static bodyValidationFailed() {
        let error = new Error(BODY_VALIDATION_FAILED_MESSAGE);
		error.code = 422;

		return error;
    }

    static skuAlreadyAssociatedForSupplier() {  // maybe find a shorter name
        let error = new Error(SUPPLIER_ALREADY_SELLING_SKU_MESSAGE);
		error.code = 422;

		return error;
    }

    static itemAlreadySoldBySupplier() {
        let error = new Error(SUPPLIER_ALREADY_SELLING_ITEM_MESSAGE);
		error.code = 422;

		return error;
    }
}

module.exports = { ItemErrorFactory }