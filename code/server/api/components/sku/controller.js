const SkuDAO = require('./dao')
const Sku = require("./sku");
const { SkuErrorFactory } = require('./error');
const Cache = require('lru-cache')
//const sizeof = require('object-sizeof')

class SkuController {
	constructor() {
		this.dao = new SkuDAO();
		this.skuMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
		this.enableCache = (process.env.ENABLE_MAP === "true") || false;
		this.allInCache = false;
	}

	async initMap() {
		const allSku = await this.dao.getAllSkus()
			.catch(() => { throw SkuErrorFactory.initializeMapFailed() });

		if (this.enableCache && allSku.length < this.skuMap.max) {
			allSku.map((sku) => this.skuMap.set(sku.id, sku));
			this.allInCache = true;
		}
	}

	async getAllSkus(req, res, next) {
		try {
			if (this.enableCache && this.allInCache) {
				const allSku = Array.from(this.skuMap.values());
				return res.status(200).json(allSku);
			}

			const rows = await this.dao.getAllSkus();
			const skus = rows.map(record => new Sku(record.id, record.description, record.weight, record.volume, record.notes,
				record.position, record.availableQuantity, record.price));

			if (this.enableCache && rows.length < this.skuMap.max) {
				allSku.map((sku) => this.skuMap.set(sku.id, sku));
				this.allInCache = true;
			}

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

			const sku = new Sku(row.id, row.description, row.weight, row.volume, row.notes,
				row.position, row.availableQuantity, row.price);

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

			if (this.enableCache) {
				let sku = this.skuMap.get(Number(skuId));
				sku.description = rawSku.newDescription;
				sku.weight = rawSku.newWeight;
				sku.volume = rawSku.newVolume;
				sku.notes = rawSku.newNotes;
				sku.price = rawSku.newPrice;
				sku.availableQuantity = rawSku.newAvailableQuantity;
			}

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

			if (this.enableCache) {
				let sku = this.skuMap.get(Number(skuId));
				sku.position = newPosition;
			}

			await this.dao.addModifySkuPosition(skuId, newPosition);

			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async deleteSku(req, res, next) {
		try {
			const skuId = req.params.id;

			if (this.enableCache) {
				this.skuMap.delete(Number(skuId));
			}

			await this.dao.deleteSku(skuId);

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = SkuController;