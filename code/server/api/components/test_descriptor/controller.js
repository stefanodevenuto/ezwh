const TestDescriptorDAO = require('./dao')
const TestDescriptor = require("./testDescriptor");
const { TestDescriptorErrorFactory } = require('./error');
const { SkuErrorFactory } = require('../sku/error');

class TestDescriptorController {
	constructor() {
		this.dao = new TestDescriptorDAO();
	}

	// ################################ API

	async getAllTestDescriptors() {
		const rows = await this.dao.getAllTestDescriptors();
		const testDescriptors = rows.map(record => new TestDescriptor(record.id, record.name,
			record.procedureDescription, record.idSKU));

		return testDescriptors;
	}

	async getTestDescriptorByID(testDescriptorId) {
		const row = await this.dao.getTestDescriptorByID(testDescriptorId);
		if (row === undefined)
			throw TestDescriptorErrorFactory.newTestDescriptorNotFound();

		const testDescriptor = new TestDescriptor(row.id, row.name,
			row.procedureDescription, row.idSKU);

		return testDescriptor;
	}

	async createTestDescriptor(name, procedureDescription, idSKU) {
		try {
			await this.dao.createTestDescriptor(name, procedureDescription, idSKU);
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("FOREIGN"))
					err = SkuErrorFactory.newSkuNotFound();
				if (err.message.includes("testDescriptor.idSKU"))
					err = TestDescriptorErrorFactory.newSKUAlreadyWithTestDescriptor();
			}

			throw err;
		}
	}

	async modifyTestDescriptor(testDescriptorId, newName, newProcedureDescription, newIdSKU) {
		try {
			const { changes } = await this.dao.modifyTestDescriptor(testDescriptorId, newName, newProcedureDescription, newIdSKU);
			if (changes === 0)
				throw TestDescriptorErrorFactory.newTestDescriptorNotFound();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("testDescriptor.idSKU"))
					err = TestDescriptorErrorFactory.newSKUAlreadyWithTestDescriptor();
				else if (err.message.includes("FOREIGN"))
					err = SkuErrorFactory.newSkuNotFound();
			}

			throw err;
		}
	}

	async deleteTestDescriptor(testDescriptorId) {
		await this.dao.deleteTestDescriptor(testDescriptorId);
	}
}

module.exports = TestDescriptorController;