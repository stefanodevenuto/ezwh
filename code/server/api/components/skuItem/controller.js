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
		const { action, value } = data;

		if (action === "DELETE_SKU") {
			const skuId = value;
			let skuItem = this.SKUItemMap.find((skuItemValue) => skuItemValue.SKUId === skuId);
			if (skuItem !== undefined)
				skuItem.SKUId = null;
		}
	}

	async getAllSKUItems(req, res, next) {
		try {
			const rows = await this.dao.getAllSKUItems();
			const SKUItems = rows.map(record => new SKUItem(record.RFID, record.skuId, record.available, record.dateOfStock));

			return res.status(200).json(SKUItems);
		} catch (err) {
			return next(err);
		}
	}

	async getSKUItemByRFID(req, res, next) {
		try {
			const SKUItemId = req.params.rfid;
			const skuItem = await this.getSKUItemByRFIDInternal(SKUItemId);
			return res.status(200).json(skuItem);
		} catch (err) {
			return next(err);
		}
	}

	async getSKUItemBySKUID(req, res, next) {
		try {

			const skuId = req.params.id;

			// To check if exists
			// await this.skuController.getSkuByID(skuId);

			const rows = await this.dao.getSKUItemBySKUID(skuId);

			const SKUItems = rows.map(record => new SKUItem(record.RFID, record.SKUId,
				record.available, record.dateOfStock));
			return res.status(200).json(SKUItems);
		} catch (err) {
			return next(err);
		}
	}

	async createSKUItem(req, res, next) {
		try {
			const rawSKUItem = req.body;
			const { id } = await this.dao.createSKUItem(rawSKUItem);

			if (this.enableCache) {
				const skuItem = new SKUItem(id, rawSKUItem.SKUId, 0, rawSKUItem.dateOfStock);
				this.SKUItemMap.set(skuItem.RFID, skuItem);
			}

			return res.status(201).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("skuItem.RFID"))
					err = SKUItemErrorFactory.newSKUItemRFIDNotUnique();

				if (err.message.includes("FOREIGN"))
					err = SkuErrorFactory.newSkuNotFound();
			}

			return next(err);
		}
	}

	async modifySKUItem(req, res, next) {
		try {
			const SKUItemId = req.params.rfid;
			const rawSKUItem = req.body;

			const { changes } = await this.dao.modifySKUItem(SKUItemId, rawSKUItem);
			if (changes === 0)
				throw SKUItemErrorFactory.newSKUItemNotFound();

			if (this.enableCache) {
				let oldSkuItem = this.SKUItemMap.get(SKUItemId);
				this.SKUItemMap.delete(SKUItemId);

				const newRFID = rawSKUItem.newRFID;

				if (oldSkuItem !== undefined) {
					oldSkuItem.RFID = newRFID;
					oldSkuItem.available = rawSKUItem.newAvailable;
					oldSkuItem.dateOfStock = rawSKUItem.newDateOfStock;
					this.SKUItemMap.set(oldSkuItem.RFID, oldSkuItem);
				}

				this.notify({ action: "UPDATE_SKUITEM", value: { oldRFID: SKUItemId, newRFID: newRFID } });
			}

			return res.status(200).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("skuItem.RFID"))
					err = SKUItemErrorFactory.newSKUItemRFIDNotUnique();
			}

			return next(err);
		}
	}

	async deleteSKUItem(req, res, next) {
		try {
			const SKUItemId = req.params.rfid;

			const { changes } = await this.dao.deleteSKUItem(SKUItemId);
			if (changes === 0)
				throw SKUItemErrorFactory.newSKUItemNotFound();

			if (this.enableCache) {
				this.SKUItemMap.delete(SKUItemId);
				this.notify({ action: "DELETE_SKUITEM", value: SKUItemId })
			}

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}

	// ################## Utilities
	async getSKUItemByRFIDInternal(rfid) {
		const SKUItemId = rfid;

		if (this.enableCache) {
			const SKUItemM = this.SKUItemMap.get(SKUItemId);

			if (SKUItemM !== undefined)
				return SKUItemM;
		}

		const row = await this.dao.getSKUItemByRFID(SKUItemId);
		if (row === undefined)
			throw SKUItemErrorFactory.newSKUItemNotFound();

		const SKUItems = new SKUItem(row.RFID, row.skuId, row.available, row.dateOfStock);

		if (this.enableCache)
			this.SKUItemMap.set(SKUItems.RFID, SKUItems)

		return SKUItems;
	}
}

module.exports = SKUItemController;