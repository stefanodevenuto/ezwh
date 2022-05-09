const TestResultDAO = require('./dao')
const TestResult = require("./testResult");
const { TestResultErrorFactory } = require('./error');
const Cache = require('lru-cache');

class TestResultController {
	constructor() {
		this.dao = new TestResultDAO();
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

	update(data) {
		const { action, value: position } = data;
		if (action === "DELETE") {
			let sku = this.skuMap.get(position.skuId);
			if (sku !== undefined)
				sku.positionId = null;
		}
	}*/

    // ################################ API
	
	async getAllTestResults(req, res, next) {
		try {
            const rfid = req.params.rfid;
            // Check if the sku item exists (ADD ERROR IN SKU ITEM CONTROLLER)
            //await this.skuItemController.getSkuItemByRFID();

			const rows = await this.dao.getAllTestResults(rfid);
			const testResults = rows.map(record => new TestResult(record.id, record.date, record.result, 
                record.testDescriptorId, record.RFID));
			return res.status(200).json(testResults);
		} catch (err) {
			return next(err);
		}
	}

	async getTestResultByID(req, res, next) {
		try {
			const skuId = Number(req.params.id);
            const rfid = req.params.rfid;

			if (this.enableCache) {
				const testResult = this.testResultMap.get(rfid);

				if (testResult !== undefined)
					return res.status(200).json(testResult);
			}

            // Check if the sku item exists (ADD ERROR IN SKU ITEM CONTROLLER)
            //await this.skuItemController.getSkuItemByRFID();

			const row = await this.dao.getTestResultByID(rfid, skuId);
			if (row === undefined)
				throw TestResultErrorFactory.newTestResultNotFound();

			let testResult = new TestResult(row.id, row.date, row.result, 
                row.testDescriptorId, row.RFID);

			if (this.enableCache)
				this.testResultMap.set(testResult.id, testResult)

			return res.status(200).json(testResult);
		} catch (err) {
			return next(err);
		}
	}

    /*
	async createSku(req, res, next) {
		try {
			const rawSku = req.body;
			const { id } = await this.dao.createSku(rawSku);

			if (this.enableCache) {
				const sku = new Sku(id, rawSku.description, rawSku.weight, rawSku.volume,
					rawSku.notes, null, rawSku.availableQuantity, rawSku.price);

				this.skuMap.set(Number(id), sku);
			}

			return res.status(201).send();
		} catch (err) {
			return next(err);
		}
	}

	async modifySku(req, res, next) {
		try {
			const skuId = req.params.id;
			const rawSku = req.body;

			const totalWeight = rawSku.newAvailableQuantity * rawSku.newWeight;
			const totalVolume = rawSku.newAvailableQuantity * rawSku.newVolume;

			const { changes } = await this.dao.modifySku(skuId, rawSku, totalWeight, totalVolume);

			// ERROR: no SKU associated to id
			if (changes === 0)
				throw SkuErrorFactory.newSkuNotFound();

			if (this.enableCache) {
				let sku = this.skuMap.get(Number(skuId));

				if (sku !== undefined) {
					sku.description = rawSku.newDescription;
					sku.weight = rawSku.newWeight;
					sku.volume = rawSku.newVolume;
					sku.notes = rawSku.newNotes;
					sku.price = rawSku.newPrice;
					sku.availableQuantity = rawSku.newAvailableQuantity;

					this.notify({action: "UPDATE_QUANTITY", value: sku});
				}
			}

			return res.status(200).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
                if (err.message.includes("occupiedWeight"))
                    err = PositionErrorFactory.newGreaterThanMaxWeightPosition();
                else if (err.message.includes("occupiedVolume"))
                    err = PositionErrorFactory.newGreaterThanMaxVolumePosition();
            }

			return next(err);
		}
	}

	async addModifySkuPosition(req, res, next) {
		try {
			const skuId = Number(req.params.id);
			const newPosition = req.body.position;

			let skuInDB = undefined;
			if (this.enableCache) {
				let sku = this.skuMap.get(skuId);

				if (sku !== undefined)
					skuInDB = sku; 
			}

			const totalChanges = await this.dao.addModifySkuPosition(skuId, newPosition, skuInDB);

			if (totalChanges === 0)
				throw SkuErrorFactory.newSkuNotFound();

			//if (totalChanges === 1)
			//	throw PositionErrorFactory.newPositionNotFound();

			if (this.enableCache) {
				let sku = this.skuMap.get(skuId);

				if (sku !== undefined) {
					sku.positionId = newPosition;
				}
			}

			return res.status(200).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("sku.positionId"))
					err = SkuErrorFactory.newPositionAlreadyOccupied();
				else if(err.message.includes("FOREIGN"))
					err = PositionErrorFactory.newPositionNotFound();
				else if (err.message.includes("occupiedWeight"))
                    err = PositionErrorFactory.newGreaterThanMaxWeightPosition();
                else if (err.message.includes("occupiedVolume"))
                    err = PositionErrorFactory.newGreaterThanMaxVolumePosition();
			}
			return next(err);
		}
	}

	async deleteSku(req, res, next) {
		try {
			const skuId = req.params.id;

			const { changes } = await this.dao.deleteSku(skuId);
			if (changes === 0)
				throw SkuErrorFactory.newSkuNotFound();

			if (this.enableCache) {
				this.skuMap.delete(Number(skuId));
			}

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}*/
}

module.exports = TestResultController;