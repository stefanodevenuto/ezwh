const ITEM_NOT_FOUND_MESSAGE = "No item associated to provided id!";           //item not found (while requesting)
const SUPPLIER_ALREADY_SELLING_SKU_MESSAGE  = "The supplier is already selling an item with the same SKUId!";
const SUPPLIER_ALREADY_SELLING_ITEM_MESSAGE = "The supplier is already selling an item with this id!";
const SKU_OR_SUPPLIER_NOT_EXISTING = "The supplier and/or the Sku Id indicated don't exist!";

class ItemErrorFactory {
    static itemNotFound() {
        let error = new Error(ITEM_NOT_FOUND_MESSAGE);
		error.code = 404;

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

    static newSkuOrSupplierNotFound() {
        let error = new Error(SKU_OR_SUPPLIER_NOT_EXISTING);
		error.code = 422;

		return error;
    }
}

module.exports = { ItemErrorFactory }