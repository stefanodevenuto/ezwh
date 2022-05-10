const TESTRESULT_NOT_FOUND_MESSAGE        = "No Test Result associated to id";
const TESTDESCRIPTOR_OR_SKUITEM_NOT_FOUND = "No Test Descriptor associated to idTestDescriptor or rfid not associated to any Sku Item";

class TestResultErrorFactory {
    static newTestResultNotFound() {
        let error = new Error(TESTRESULT_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }

    static newTestDescriptorOrSkuItemNotFound() {
        let error = new Error(TESTDESCRIPTOR_OR_SKUITEM_NOT_FOUND);
		error.code = 404;

		return error;
    }
}

module.exports = { TestResultErrorFactory }