const TestResultDAO = require('./dao')
const TestResult = require("./testResult");
const { TestResultErrorFactory } = require('./error');
const Cache = require('lru-cache');

class TestResultController {
	constructor(skuItemController) {
		this.dao = new TestResultDAO();
		this.skuItemController = skuItemController;
		this.testResultMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
		this.enableCache = (process.env.ENABLE_MAP === "true") || false;
		this.observers = [];
	}

	// ################################ Observer-Observable Pattern

	/*addObserver(observer) {
		this.observers.push(observer);
	}

	notify(data) {
		if (this.observers.length > 0) {
			this.observers.forEach(observer => observer.update(data));
		}
	}
	*/

	update(data) {
		const { action, value } = data;
		if (action === "DELETE_TESTDESCRIPTOR") {
			const testDescriptorId = value;
			let testResult = this.testResultMap.get(testDescriptorId);
			if (testResult !== undefined)
				testResult.testDescriptorId = null;
		}

		if (action === "UPDATE_SKUITEM") {
			const { oldRFID, newRFID } = value;

			this.testResultMap.forEach((testResultValue) => {
				if (testResultValue.RFID === oldRFID)
					testResultValue.RFID = newRFID;
			});
		}

		if (action === "DELETE_SKUITEM") {
			const SKUItemId = value;

			this.testResultMap.forEach((testResultValue) => {
				if (testResultValue.RFID === SKUItemId)
					testResultValue.RFID = null;
			});
		}
	}

	// ################################ API

	async getAllTestResults(req, res, next) {
		try {
			const rfid = req.params.rfid;
			
			// Check if the sku item exists
			await this.skuItemController.getSKUItemByRFIDInternal(rfid);

			const rows = await this.dao.getAllTestResults(rfid);
			const testResults = rows.map(record => new TestResult(record.id, record.date, record.result == 1,
				record.testDescriptorId, record.RFID));
			return res.status(200).json(testResults);
		} catch (err) {
			return next(err);
		}
	}

	async getTestResultByID(req, res, next) {
		try {
			const testResultId = req.params.id;
			const rfid = req.params.rfid;

			if (this.enableCache) {
				const testResult = this.testResultMap.get(`${rfid}${testResultId}`);

				if (testResult !== undefined)
					return res.status(200).json(testResult);
			}

			// Check if the sku item exists
			await this.skuItemController.getSKUItemByRFIDInternal(rfid);

			const row = await this.dao.getTestResultByID(rfid, testResultId);
			if (row === undefined)
				throw TestResultErrorFactory.newTestResultNotFound();

			let testResult = new TestResult(row.id, row.date, row.result == 1,
				row.testDescriptorId, row.RFID);

			if (this.enableCache)
				this.testResultMap.set(`${testResult.RFID}${testResult.id}`, testResult)

			return res.status(200).json(testResult);
		} catch (err) {
			return next(err);
		}
	}

	async createTestResult(req, res, next) {
		try {
			const rawTestResult = req.body;

			const id = await this.dao.createTestResult(rawTestResult);

			if (this.enableCache) {
				const testResult = new TestResult(id, rawTestResult.date, rawTestResult.result == 1,
					rawTestResult.testDescriptorId, rawTestResult.RFID);

				this.testResultMap.set(`${testResult.RFID}${testResult.id}`, testResult);
			}

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

			// ERROR: no TestResult associated to id
			if (changes === 0)
				throw TestResultErrorFactory.newTestResultNotFound();

			if (this.enableCache) {
				let testResult = this.testResultMap.get(`${rfid}${id}`);

				if (testResult !== undefined) {
					testResult.testDescriptorId = rawTestResult.newIdTestDescriptor;
					testResult.date = rawTestResult.newDate;
					testResult.result = rawTestResult.newResult;
				}
			}

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

			if (this.enableCache) {
				this.testResultMap.delete(`${rfid}${id}`);
			}

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