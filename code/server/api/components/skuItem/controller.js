const SKUItemDAO = require('./dao')
const SKUItem = require("./SKUItem");
const { SKUItemErrorFactory } = require('./error');
const { SKUErrorFactory, SkuErrorFactory } = require('../sku/error');
const Cache = require('lru-cache');
const SkuController = require('../sku/controller');
//const sizeof = require('object-sizeof')

class SKUItemController {
	constructor() {
		this.dao = new SKUItemDAO();
		this.skuController = new SkuController;
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
		const {action, value} = data;
		if (action === "DELETE_SKUITEM") {
			const skuItemId = value;
			let skuItem = this.skuItemMap(skuItemId);
			if (skuItem !== undefined)
			   skuItem.skuId = null;		 
		} else if(action === "UPDATE_SKUITEM"){
			const oldSkuItem = value;
			let skuItem = this.skuItemMap(oldSkuItem.id);
			
		}
	}

	/*async initMap() {
		const allSKUItem = await this.dao.getAllSKUItems()
			.catch(() => { throw SKUItemErrorFactory.initializeMapFailed() });

		if (this.enableCache && allSKUItem.length < this.SKUItemMap.max) {
			allSKUItem.map((SKUItem) => this.SKUItemMap.set(SKUItem.RFID, SKUItem));
			this.allInCache = true;
		}
	}*/

	async getAllSKUItems(req, res, next) {
		try {
			const rows = await this.dao.getAllSKUItems();
			const SKUItems = rows.map(record => new SKUItem(record.RFID, record.SKUId, record.available, record.dateOfStock));

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

			const sku = await this.skuController.getSkuByID(skuId);
			if(sku === undefined)
				throw SkuErrorFactory.newSkuNotFound();

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
			if (err.code === "SQLITE_CONSTRAINT")
				err = SkuErrorFactory.newSkuNotFound();
			 
			return next(err);
		}
	}

	async modifySKUItem(req, res, next) {
		try {
			const SKUItemId = req.params.rfid;
			const rawSKUItem = req.body;

			await this.dao.modifySKUItem(SKUItemId, rawSKUItem);


			if (this.enableCache) {
				let oldSkuItem = this.skuItemMap.get(SKUItemId);
				this.skuItemMap.delete(SKUItemId);
			 
				if (oldSkuItem !== undefined) {
				   oldSkuItem.RFID = rawSKUItem.newRFID;
				   oldSkuItem.available = rawSKUItem.newAvailable;
				   oldSkuItem.dateOfStock = rawSKUItem.newDateOfStock;
				}
			 
				this.skuItemMap.set(oldSkuItem.RFID, oldSkuItem);
				// notify({action: "UPDATE_SKUITEM", value: oldSkuItem}), but I can do it if you want
			 }

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

			notify({action: "DELETE_SKUITEM", value: SKUItemId})

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = SKUItemController;