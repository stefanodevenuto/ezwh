const TESTDESCRIPTOR_NOT_FOUND_MESSAGE = "No Test Descriptor associated to id";
const SKU_NOT_UNIQUE = "The SKU associated to id already has a Test Descriptor associated";

class TestDescriptorErrorFactory {
    static newTestDescriptorNotFound() {
        let error = new Error(TESTDESCRIPTOR_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }

    static newSKUAlreadyWithTestDescriptor() {
        let error = new Error(SKU_NOT_UNIQUE);
		error.code = 404;

		return error;
    }
}

module.exports = { TestDescriptorErrorFactory }