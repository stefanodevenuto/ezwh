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
		this.observers = [];

	}

	
	addObserver(observer) {
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
				SKUItems.map((SKUItem) => this.SKUItemMap.set(SKUItem.RFID, SKUItem));
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
				const SKUItemM = this.SKUItemMap.get(SKUItemId);

				if (SKUItemM !== undefined)
					return res.status(200).json(SKUItemM);
			}

			const row = await this.dao.getSKUItemByRFID(SKUItemId);
			if (row === undefined)
				throw SKUItemErrorFactory.newSKUItemNotFound();

			const SKUItems = new SKUItem(row.RFID, row.SKUId, row.available, row.dateOfStock);

			if (this.enableCache)
				this.SKUItemMap.set(SKUItems.RFID, SKUItems)

			return res.status(200).json(SKUItems);
		} catch (err) {
			return next(err);
		}
	}

	async getSKUItemBySKUID(req, res, next) {
		try {
			
			const skuId = req.params.id;

			if (this.enableCache) {
				const SKUItem = this.SKUItemMap.get(skuId);

				if (SKUItem !== undefined)
					return res.status(200).json(SKUItem);
			}

			const row = await this.dao.getSKUItemBySKUID(skuId);
			if (row === undefined)
				throw SKUItemErrorFactory.newSKUItemNotFound();

			const SKUItems = new SKUItem(row.RFID, row.SKUId, row.available, row.dateOfStock);

			if (this.enableCache)
				this.SKUItemMap.set(SKUItems.RFID, SKUItems)

			return res.status(200).json(SKUItems);
		} catch (err) {
			return next(err);
		}
	}

	async createSKUItem(req, res, next) {
		try {
			const rawSKUItem = req.body;
			const { RFID } = await this.dao.createSKUItem(rawSKUItem);

			if (this.enableCache) {
				const SKUItems = new SKUItem(rawSKUItem.RFID, rawSKUItem.SKUId, 0, rawSKUItem.dateOfStock);

				this.SKUItemMap.set(RFID, SKUItems);
	
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
				let SKUItems = this.SKUItemMap.get(SKUItemId);
				SKUItems.RFID = rawSKUItem.newRFID;
				SKUItems.available = rawSKUItem.newAvailable;
				SKUItems.dateOfStock = rawSKUItem.newDateOfStock;
			}

			await this.dao.modifySKUItem(SKUItemId, rawSKUItem);

			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async deleteSKUItem(req, res, next) {
		try {
			const SKUItemId = req.params.rfid;

			if (this.enableCache) {
				this.SKUItemMap.delete((SKUItemId));
			}
			
			await this.dao.deleteSKUItem(SKUItemId);

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = SKUItemController;