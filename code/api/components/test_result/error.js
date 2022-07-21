const TESTRESULT_NOT_FOUND_MESSAGE        = "No Test Result associated to id";
const TESTDESCRIPTOR_OR_SKUITEM_NOT_FOUND = "No Test Descriptor associated to idTestDescriptor or rfid not associated to any Sku Item";

class TestResultErrorFactory {
    static newTestResultNotFound() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = TESTRESULT_NOT_FOUND_MESSAGE;

		return error;
    }

    static newTestDescriptorOrSkuItemNotFound() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = TESTDESCRIPTOR_OR_SKUITEM_NOT_FOUND;

		return error;
    }
}

module.exports = { TestResultErrorFactory }