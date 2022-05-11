const SKUItemDAO = require('./dao')
const SKUItem = require("./SKUItem");
const { SKUItemErrorFactory } = require('./error');
const Cache = require('lru-cache')
//const sizeof = require('object-sizeof')

class SKUItemController {
	constructor() {
		this.dao = new SKUItemDAO();
		this.SKUItemMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
		this.enableCache = (process.env.ENABLE_MAP === "true") || false;
		this.allInCache = false;
	}

	async initMap() {
		const allSKUItem = await this.dao.getAllSKUItems()
			.catch(() => { throw SKUItemErrorFactory.initializeMapFailed() });

		if (this.enableCache && allSKUItem.length < this.SKUItemMap.max) {
			allSKUItem.map((SKUItem) => this.SKUItemMap.set(SKUItem.RFID, SKUItem));
			this.allInCache = true;
		}
	}

	async getAllSKUItems(req, res, next) {
		try {
			if (this.enableCache && this.allInCache) {
				const allSKUItem = Array.from(this.SKUItemMap.values());
				return res.status(200).json(allSKUItem);
			}

			const rows = await this.dao.getAllSKUItems();
			const SKUItems = rows.map(record => new SKUItem(record.RFID, record.SKUId, record.available, record.dateOfStock));

			if (this.enableCache && rows.length < this.SKUItemMap.max) {
				SKUItems.map((SKUItem) => this.SKUItemMap.set(RFID, SKUItem));
				this.allInCache = true;
			}

			return res.status(200).json(SKUItems);
		} catch (err) {
			return next(err);
		}
	}

	async getSKUItemByRFID(req, res, next) {
		try {
			const SKUItemId = req.params.rfid;

			if (this.enableCache) {
				const SKUItem = this.SKUItemMap.get(SKUItemId);

				if (SKUItem !== undefined)
					return res.status(200).json(SKUItem);
			}

			const row = await this.dao.getSKUItemByRFID(SKUItemId);
			if (row === undefined)
				throw SKUItemErrorFactory.newSKUItemNotFound();

			const SKUItem = new SKUItem(row.RFID, row.SKUId, row.available, row.dateOfStock);

			if (this.enableCache)
				this.SKUItemMap.set(SKUItem.RFID, SKUItem)

			return res.status(200).json(SKUItem);
		} catch (err) {
			return next(err);
		}
	}

	async getSKUItemBySKUID(req, res, next) {
		try {
			
			const SKUPId = req.params.id;

			if (this.enableCache) {
				const SKUItem = this.SKUItemMap.get(SKUPId);

				if (SKUItem !== undefined)
					return res.status(200).json(SKUItem);
			}

			const row = await this.dao.getSKUItemBySKUID(SKUPId);
			if (row === undefined)
				throw SKUItemErrorFactory.newSKUItemNotFound();

			const SKUItem = new SKUItem(row.RFID, row.SKUId, row.available, row.dateOfStock);

			/*if (this.enableCache)
				this.SKUItemMap.set(SKUItem.RFID, SKUItem)
*/
			return res.status(200).json(SKUItem);
		} catch (err) {
			return next(err);
		}
	}

	async createSKUItem(req, res, next) {
		try {
			const rawSKUItem = req.body;
			const { RFID } = await this.dao.createSKUItem(rawSKUItem);

			if (this.enableCache) {
				const SKUItem = new SKUItem(rawSKUItem.RFID, rawSKUItem.SKUId, 0, rawSKUItem.dateOfStock);

				this.SKUItemMap.set(RFID, SKUItem);
	
			}

			return res.status(201).send();
		} catch (err) {
			return next(err);
		}
	}

	async modifySKUItem(req, res, next) {
		try {
			const SKUItemId = req.params.rfid;
			const rawSKUItem = req.body;

			if (this.enableCache) {
				let SKUItem = this.SKUItemMap.get(RFID);
				SKUItem.SKUId = rawSKUItem.SKUId;
				SKUItem.available = rawSKUItem.available;
				SKUItem.dateOfStock = rawSKUItem.dateOfStock;
			}

			await this.dao.modifySKUItem(SKUItemId, rawSKUItem);

			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async addModifySKUItemPosition(req, res, next) {
		try {
			const SKUItemId = req.params.id;
			const newPosition = req.body.position;

			if (this.enableCache) {
				let SKUItem = this.SKUItemMap.get(Number(SKUItemId));
				SKUItem.position = newPosition;
			}

			await this.dao.addModifySKUItemPosition(SKUItemId, newPosition);

			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async deleteSKUItem(req, res, next) {
		try {
			const SKUItemId = req.params.RFID;

			if (this.enableCache) {
				this.SKUItemMap.delete(Number(SKUItemId));
			}
			
			await this.dao.deleteSKUItem(SKUItemId);

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = SKUItemController;