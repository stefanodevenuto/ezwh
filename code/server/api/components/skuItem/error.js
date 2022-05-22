const SKUITEM_NOT_FOUND_MESSAGE = "No SKUItem associated to id";
const RFID_NOT_UNIQUE           = "The inserted RFID is already taken";
const ITEM_NOT_OWNED            = "A Sku Item is inexistent or associated to an item not sold by the Supplier of the Restock Order";

class SKUItemErrorFactory {
    static newSKUItemNotFound() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = SKUITEM_NOT_FOUND_MESSAGE;

		return error;
    }

    static newSKUItemRFIDNotUnique() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = RFID_NOT_UNIQUE;

		return error;
    }

    static newSKUItemRelatedToItemNotOwned() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = ITEM_NOT_OWNED;

		return error;
    }

}

module.exports = { SKUItemErrorFactory }