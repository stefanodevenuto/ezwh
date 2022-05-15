const TestDescriptorDAO = require('./dao')
const TestDescriptor = require("./testDescriptor");
const { TestDescriptorErrorFactory } = require('./error');
const { SkuErrorFactory } = require('../sku/error');


class TestDescriptorController {
	constructor() {
		this.dao = new TestDescriptorDAO();
	}

    // ################################ API
	
    
	async getAllTestDescriptors(req, res, next) {
		try {
			const rows = await this.dao.getAllTestDescriptors();
			const testDescriptors = rows.map(record => new TestDescriptor(record.id, record.name,
                record.procedureDescription, record.idSKU));
			return res.status(200).json(testDescriptors);
		} catch (err) {
			return next(err);
		}
	}

	async getTestDescriptorByID(req, res, next) {
		try {
			const testDescriptorId = Number(req.params.id);

			const row = await this.dao.getTestDescriptorByID(testDescriptorId);
			if (row === undefined)
				throw TestDescriptorErrorFactory.newTestDescriptorNotFound();

			let testDescriptor = new TestDescriptor(row.id, row.name,
                row.procedureDescription, row.idSKU);
			
			return res.status(200).json(testDescriptor);
		} catch (err) {
			return next(err);
		}
	}

	async createTestDescriptor(req, res, next) {
		try {
			const rawTestDescriptor = req.body;
			const id = await this.dao.createTestDescriptor(rawTestDescriptor);

			return res.status(201).send();
		} catch (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
				if(err.message.includes("FOREIGN"))
					err = SkuErrorFactory.newSkuNotFound();
			}

			return next(err);
		}
	}

	async modifyTestDescriptor(req, res, next) {
		try {
			const testDescriptorId = Number(req.params.id);
			const rawTestDescriptor = req.body;

            let testDescriptorInDB = undefined;
		
			let result = {objOrReturn: testDescriptorInDB};
			const changes = await this.dao.modifyTestDescriptor(testDescriptorId, rawTestDescriptor, result);

			if (changes === 0)
				throw TestDescriptorErrorFactory.newTestDescriptorNotFound();


			return res.status(200).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
                if (err.message.includes("testDescriptor.idSKU"))
                    err = TestDescriptorErrorFactory.newSKUAlreadyWithTestDescriptor();
                else if(err.message.includes("FOREIGN"))
					err = SkuErrorFactory.newSkuNotFound();
            }

			return next(err);
		}
	}

	async deleteTestDescriptor(req, res, next) {
		try {
			const testDescriptorId = req.params.id;

			const { changes } = await this.dao.deleteTestDescriptor(testDescriptorId);
			if (changes === 0)
				throw TestDescriptorErrorFactory.newTestDescriptorNotFound();

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = TestDescriptorController;