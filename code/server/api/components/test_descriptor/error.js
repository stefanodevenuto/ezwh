const TESTDESCRIPTOR_NOT_FOUND_MESSAGE = "No Test Descriptor associated to id";
const SKU_NOT_UNIQUE = "The SKU associated to id already has a Test Descriptor associated";

class TestDescriptorErrorFactory {
    static newTestDescriptorNotFound() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = TESTDESCRIPTOR_NOT_FOUND_MESSAGE;

		return error;
    }

    static newSKUAlreadyWithTestDescriptor() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = SKU_NOT_UNIQUE;

		return error;
    }
}

module.exports = { TestDescriptorErrorFactory }