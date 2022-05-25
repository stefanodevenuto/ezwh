const ITEM_NOT_FOUND_MESSAGE = "No item associated to provided id!";
const SUPPLIER_ALREADY_SELLING_SKU_MESSAGE  = "The supplier is already selling an item with the same SKUId!";
const SUPPLIER_ALREADY_SELLING_ITEM_MESSAGE = "The supplier is already selling an item with this id!";
const SKU_OR_SUPPLIER_NOT_EXISTING = "The supplier and/or the Sku Id indicated don't exist!";

class ItemErrorFactory {
    static itemNotFound() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = ITEM_NOT_FOUND_MESSAGE;

		return error;
    }

    static skuAlreadyAssociatedForSupplier() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = SUPPLIER_ALREADY_SELLING_SKU_MESSAGE;

		return error;
    }

    static itemAlreadySoldBySupplier() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = SUPPLIER_ALREADY_SELLING_ITEM_MESSAGE;

		return error;
    }

    static newSkuOrSupplierNotFound() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = SKU_OR_SUPPLIER_NOT_EXISTING;

		return error;
    }
}

module.exports = { ItemErrorFactory }