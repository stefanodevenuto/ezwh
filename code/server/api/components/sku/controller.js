const SkuDAO = require('./dao')
const Sku = require("./sku");
const { SkuErrorFactory } = require('./error');

class SkuController {
	constructor(enableMap) {
		this.dao = new SkuDAO();
		this.skuMap = new Map();
		this.enableMap = enableMap;
	}

	async initMap() {
		const allSku = await this.dao.getAllSkus()
							.catch(() => { throw SkuErrorFactory.initializeMapFailed() });
		
		allSku.map((sku) => this.skuMap.set(sku.id, sku));
	}

	async getAllSkus(req, res, next) {
		try {
			if (this.enableMap) {
				const allSku = Array.from(this.skuMap.values());
				return res.status(200).json(allSku);
			}

			const rows = await this.dao.getAllSkus();
			const skus = rows.map(record => new Sku(record.id, record.description, record.weight, record.volume, record.notes, 
													record.position, record.availableQuantity, record.price));

			return res.status(200).json(skus);
		} catch (err) {
			return next(err);
		}
	}

	async getSkuByID(req, res, next) {
		try {
			const skuId = req.params.id;

			if (this.enableMap) {
				const sku = this.skuMap.get(Number(skuId));

				if (sku !== undefined)
					return res.status(200).json(sku);

				// Do we trust the Map this much to let it rule? 
				/*
				if (sku === undefined)
					throw SkuErrorFactory.newSkuNotFound();
				return res.status(200).json(sku);*/
			}

			const row = await this.dao.getSkuByID(skuId);

			if (row === undefined)
				throw SkuErrorFactory.newSkuNotFound();

			const sku = new Sku(row.id, row.description, row.weight, row.volume, row.notes, 
								row.position, row.availableQuantity, row.price);

			return res.status(200).json(sku);
		} catch (err) {
			return next(err);
		}
	}

	async createSku(req, res, next) {
		try {
			const rawSku = req.body;
			const { id } = await this.dao.createSku(rawSku);
			
			if (this.enableMap) {
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

			if (this.enableMap) {
				let sku = this.skuMap.get(Number(skuId));
				sku.description = rawSku.newDescription;
				sku.weight = rawSku.newWeight;
				sku.volume = rawSku.newVolume;
				sku.notes = rawSku.newNotes;
				sku.price = rawSku.newPrice;
				sku.availableQuantity = rawSku.newAvailableQuantity;
			}

			// Do we trust the Map this much to let it rule? (without await, modification postponed)
			// this.dao.modifySku(skuId, rawSku);
			
			await this.dao.modifySku(skuId, rawSku);
			
			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async addModifySkuPosition(req, res, next) {
		try {
			const skuId = req.params.id;
			const newPosition = req.body.position;

			if (this.enableMap) {
				let sku = this.skuMap.get(Number(skuId));
				sku.position = newPosition;
			}

			// Do we trust the Map this much to let it rule? (without await, modification postponed)
			// this.dao.addModifySkuPosition(skuId, newPosition);

			await this.dao.addModifySkuPosition(skuId, newPosition);
			
			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async deleteSku(req, res, next) {
		try {
			const skuId = req.params.id;

			if (this.enableMap) {
				this.skuMap.delete(Number(skuId));
			}

			// Do we trust the Map this much to let it rule? (without await, modification postponed)
			// this.dao.deleteSku(skuId);
			await this.dao.deleteSku(skuId);
			
			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = SkuController;