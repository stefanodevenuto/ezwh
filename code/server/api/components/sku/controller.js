const SkuDAO = require('./dao')
const Sku = require("./sku");
const { SkuErrorFactory } = require('./error');
const { PositionErrorFactory } = require('../position/error');
const Cache = require('lru-cache')
//const sizeof = require('object-sizeof')

class SkuController {
	constructor() {
		this.dao = new SkuDAO();
		this.skuMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
		this.enableCache = (process.env.ENABLE_MAP === "true") || false;
		this.allInCache = false;
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

	update(data) {
		const { action, value } = data;

		if (action === "DELETE_POSITION") {
			const positionId = value;
			let sku = this.skuMap.find( (skuValue) => skuValue.positionId === positionId);
			if (sku !== undefined)
				sku.positionId = null;
		}

		if (action === "ADD_TESTDESCRIPTOR") {
			const testDescriptor = value;
			let sku = this.skuMap.get(testDescriptor.idSKU);
			if (sku !== undefined)
				sku.testDescriptorId = testDescriptor.id;
		}

		if (action === "UPDATE_TESTDESCRIPTOR") {
			const {newValue, oldIdSKU} = value;

			let oldSku = this.skuMap.get(oldIdSKU);
			if (oldSku !== undefined)
				oldSku.testDescriptorId = null;

			let sku = this.skuMap.get(newValue.id);
			if (sku !== undefined)
				sku.testDescriptorId = newValue.testDescriptorId;
		}

		if (action === "DELETE_TESTDESCRIPTOR") {
			const testDescriptorId = value;
			let sku = this.skuMap.find( (skuValue) => skuValue.testDescriptorId === testDescriptorId);
			if (sku !== undefined)
				sku.testDescriptorId = null;
		}
	}

    // ################################ API
	
	async getAllSkus(req, res, next) {
		try {
			const rows = await this.dao.getAllSkus();
			const skus = rows.map(record => new Sku(record.id, record.description, record.weight, record.volume, record.notes,
				record.positionId, record.availableQuantity, record.price, record.testDescriptorId));
			return res.status(200).json(skus);
		} catch (err) {
			return next(err);
		}
	}

	async getSkuByID(req, res, next) {
		try {
			const skuId = Number(req.params.id);

			if (this.enableCache) {
				const sku = this.skuMap.get(Number(skuId));

				if (sku !== undefined)
					return res.status(200).json(sku);
			}

			const row = await this.dao.getSkuByID(skuId);
			if (row === undefined)
				throw SkuErrorFactory.newSkuNotFound();

			let sku;
			/*let position = null;
			if (this.enableCache) {
				if (row.positionId !== null)
					position = await this.positionController.getPositionByIDInternal(row.positionId);

				sku = new Sku(row.id, row.description, row.weight, row.volume, row.notes,
					position, row.availableQuantity, row.price);
			} else {*/
				sku = new Sku(row.id, row.description, row.weight, row.volume, row.notes,
					row.positionId, row.availableQuantity, row.price, row.testDescriptorId);
			//}

			if (this.enableCache)
				this.skuMap.set(sku.id, sku)

			return res.status(200).json(sku);
		} catch (err) {
			return next(err);
		}
	}

	async createSku(req, res, next) {
		try {
			const rawSku = req.body;
			const { id } = await this.dao.createSku(rawSku);

			if (this.enableCache) {
				const sku = new Sku(id, rawSku.description, rawSku.weight, rawSku.volume,
					rawSku.notes, null, rawSku.availableQuantity, rawSku.price, rawSku.testDescriptorId);

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
	}
}

module.exports = SkuController;