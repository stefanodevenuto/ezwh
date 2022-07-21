const TestResultDAO = require('./dao')
const TestResult = require("./testResult");
const { TestResultErrorFactory } = require('./error');

class TestResultController {
	constructor(skuItemController) {
		this.dao = new TestResultDAO();
		this.skuItemController = skuItemController;
	}

	// ################################ API

	async getAllTestResults(rfid) {
		// Check if the sku item exists
		await this.skuItemController.getSKUItemByRFIDInternal(rfid);

		const rows = await this.dao.getAllTestResults(rfid);
		const testResults = rows.map(record => new TestResult(record.id, record.date, record.result == 1,
			record.testDescriptorId, record.RFID).intoJson());

		return testResults;
	}

	async getTestResultByID(rfid, testResultId) {

		// Check if the sku item exists
		await this.skuItemController.getSKUItemByRFIDInternal(rfid);

		const row = await this.dao.getTestResultByID(rfid, testResultId);
		if (row === undefined)
			throw TestResultErrorFactory.newTestResultNotFound();

		let testResult = new TestResult(row.id, row.date, row.result == 1,
			row.testDescriptorId, row.RFID);

		return testResult.intoJson();
	}

	async createTestResult(rfid, idTestDescriptor, Date, Result) {
		try {
			await this.dao.createTestResult(rfid, idTestDescriptor, Date, Result);
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("FOREIGN KEY"))
					err = TestResultErrorFactory.newTestDescriptorOrSkuItemNotFound()
			}

			throw err;
		}
	}

	async modifyTestResult(rfid, id, newIdTestDescriptor, newDate, newResult) {
		try {
			const { changes } = await this.dao.modifyTestResult(id, rfid, newIdTestDescriptor, newDate, newResult);
			if (changes === 0)
				throw TestResultErrorFactory.newTestResultNotFound();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("FOREIGN KEY"))
					err = TestResultErrorFactory.newTestDescriptorOrSkuItemNotFound()
			}

			throw err;
		}
	}

	async deleteTestResult(rfid, id) {
		await this.dao.deleteTestResult(rfid, id);
	}

	// ################################ Utilities

	async hasFailedTestResultsByRFID(RFID) {
		const { failedQuantity } = await this.dao.hasFailedTestResultsByRFID(RFID);
		if (failedQuantity == 0)
			return false;

		return true;
	}
}

module.exports = TestResultController;