const TestResultDAO = require('./dao')
const TestResult = require("./testResult");
const { TestResultErrorFactory } = require('./error');

class TestResultController {
	constructor(skuItemController) {
		this.dao = new TestResultDAO();
		this.skuItemController = skuItemController;
		this.observers = [];
	}

	// ################################ API

	async getAllTestResults(req, res, next) {
		try {
			const rfid = req.params.rfid;
			
			// Check if the sku item exists
			await this.skuItemController.getSKUItemByRFIDInternal(rfid);

			const rows = await this.dao.getAllTestResults(rfid);
			const testResults = rows.map(record => new TestResult(record.id, record.date, record.result == 1,
				record.testDescriptorId, record.RFID).intoJson());

			return res.status(200).json(testResults);
		} catch (err) {
			return next(err);
		}
	}

	async getTestResultByID(req, res, next) {
		try {
			const testResultId = req.params.id;
			const rfid = req.params.rfid;

			// Check if the sku item exists
			await this.skuItemController.getSKUItemByRFIDInternal(rfid);

			const row = await this.dao.getTestResultByID(rfid, testResultId);
			if (row === undefined)
				throw TestResultErrorFactory.newTestResultNotFound();

			let testResult = new TestResult(row.id, row.date, row.result == 1,
				row.testDescriptorId, row.RFID);

			return res.status(200).json(testResult.intoJson());
		} catch (err) {
			return next(err);
		}
	}

	async createTestResult(req, res, next) {
		try {
			const rawTestResult = req.body;
			await this.dao.createTestResult(rawTestResult);
			return res.status(201).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("FOREIGN KEY"))
					err = TestResultErrorFactory.newTestDescriptorOrSkuItemNotFound()
			}

			return next(err);
		}
	}


	async modifyTestResult(req, res, next) {
		try {
			const id = req.params.id;
			const rfid = req.params.rfid;
			const rawTestResult = req.body;

			const { changes } = await this.dao.modifyTestResult(id, rfid, rawTestResult);
			if (changes === 0)
				throw TestResultErrorFactory.newTestResultNotFound();

			return res.status(200).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("FOREIGN KEY"))
					err = TestResultErrorFactory.newTestDescriptorOrSkuItemNotFound()
			}

			return next(err);
		}
	}

	async deleteTestResult(req, res, next) {
		try {
			const id = req.params.id;
			const rfid = req.params.rfid;

			const { changes } = await this.dao.deleteTestResult(rfid, id);
			if (changes === 0)
				throw TestResultErrorFactory.newTestResultNotFound();

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
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