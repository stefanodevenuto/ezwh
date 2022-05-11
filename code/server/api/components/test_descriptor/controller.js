const TestDescriptorDAO = require('./dao')
const TestDescriptor = require("./testDescriptor");
const { TestDescriptorErrorFactory } = require('./error');
const { SkuErrorFactory } = require('../sku/error');
const Cache = require('lru-cache');

class TestDescriptorController {
	constructor() {
		this.dao = new TestDescriptorDAO();
		this.testDescriptorMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
		this.enableCache = (process.env.ENABLE_MAP === "true") || false;
		this.observers = [];
	}

	// ################################ Observer-Observable Pattern

	addObserver(observer) {
        this.observers.push(observer);
    }

    notify(data) {
        if (this.observers.length > 0) {
            this.observers.forEach(observer => observer.update(data));
        }
    }

    /*
	update(data) {
		const { action, value: position } = data;
		if (action === "DELETE") {
			let sku = this.skuMap.get(position.skuId);
			if (sku !== undefined)
				sku.positionId = null;
		}
	}*/

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

			if (this.enableCache) {
				const testDescriptor = this.testDescriptorMap.get(Number(testDescriptorId));

				if (testDescriptor !== undefined)
					return res.status(200).json(testDescriptor);
			}

			const row = await this.dao.getTestDescriptorByID(testDescriptorId);
			if (row === undefined)
				throw TestDescriptorErrorFactory.newTestDescriptorNotFound();

			let testDescriptor = new TestDescriptor(row.id, row.name,
                row.procedureDescription, row.idSKU);
			
			if (this.enableCache)
				this.testDescriptorMap.set(testDescriptor.id, testDescriptor);

			return res.status(200).json(testDescriptor);
		} catch (err) {
			return next(err);
		}
	}

	async createTestDescriptor(req, res, next) {
		try {
			const rawTestDescriptor = req.body;
			const id = await this.dao.createTestDescriptor(rawTestDescriptor);

			if (this.enableCache) {
				const testDescriptor = new TestDescriptor(id, rawTestDescriptor.name,
                    rawTestDescriptor.procedureDescription, rawTestDescriptor.idSKU);

                console.log(testDescriptor)

				this.testDescriptorMap.set(Number(id), testDescriptor);
                this.notify({action: "ADD_TESTDESCRIPTOR", value: testDescriptor});
            }

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
			if (this.enableCache) {
				let testDescriptor = this.testDescriptorMap.get(testDescriptorId);

				if (testDescriptor !== undefined)
					testDescriptorInDB = testDescriptor; 
			}

            let result = {objOrReturn: testDescriptorInDB};
			const changes = await this.dao.modifyTestDescriptor(testDescriptorId, rawTestDescriptor, result);

			if (changes === 0)
				throw TestDescriptorErrorFactory.newTestDescriptorNotFound();

			if (this.enableCache) {
				let testDescriptor = this.testDescriptorMap.get(Number(testDescriptorId));
                const oldIdSKU = result.objOrReturn;
                const newIdSKU = rawTestDescriptor.newIdSKU;

				if (testDescriptor !== undefined) {
					testDescriptor.name = rawTestDescriptor.newName;
					testDescriptor.procedureDescription = rawTestDescriptor.newProcedureDescription;
					testDescriptor.idSKU = rawTestDescriptor.newIdSKU;
				}

                this.notify({action: "UPDATE_TESTDESCRIPTOR", value: {
                    newValue: {id: newIdSKU, testDescriptorId: testDescriptorId}, oldIdSKU
                } });
			}

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

			if (this.enableCache) {
				this.testDescriptorMap.delete(Number(testDescriptorId));
                this.notify({action: "DELETE_TESTDESCRIPTOR", value: testDescriptorId});
			}

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = TestDescriptorController;