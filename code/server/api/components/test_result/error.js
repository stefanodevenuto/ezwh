const TESTRESULT_NOT_FOUND_MESSAGE = "No Test Result associated to id";

class TestResultErrorFactory {
    static newSkuNotFound() {
        let error = new Error(TESTRESULT_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }
}

module.exports = { TestResultErrorFactory }