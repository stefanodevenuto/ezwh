const SKUItemDAO = require('./dao')
const SKUItem = require("./SKUItem");
const { SKUItemErrorFactory } = require('./error');
const { SkuErrorFactory } = require('../sku/error');
const { RestockOrderErrorFactory } = require('../restock_order/error');
const SkuController = require('../sku/controller');

class SKUItemController {
	constructor(skuController) {
		this.dao = new SKUItemDAO();
		this.skuController = skuController;
	}

	async getAllSKUItems(req, res, next) {
		try {
			const rows = await this.dao.getAllSKUItems();
			const SKUItems = rows.map(record => new SKUItem(record.RFID, record.skuId,
				record.available, record.dateOfStock, record.restockOrderId));

			return res.status(200).json(rows);
		} catch (err) {
			return next(err);
		}
	}

	async getSKUItemBySKUID(req, res, next) {
		try {
			const skuId = req.params.id;

			// To check if exists
			await this.skuController.getSkuByIDInternal(skuId);

			const rows = await this.dao.getSKUItemBySKUID(skuId);

			const SKUItems = rows.map(record => new SKUItem(record.RFID, record.SKUId,
				record.available, record.dateOfStock, record.restockOrderId));
			return res.status(200).json(SKUItems);
		} catch (err) {
			return next(err);
		}
	}

	async getSKUItemBySKUID(req, res, next) {
		try {
			const skuId = req.params.id;

			// To check if exists
			await this.skuController.getSkuByIDInternal(skuId);

			const rows = await this.dao.getSKUItemBySKUID(skuId);

			const SKUItems = rows.map(record => new SKUItem(record.RFID, record.SKUId,
				record.available, record.dateOfStock, record.restockOrderId));
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

	async createSKUItem(req, res, next) {
		try {
			const rawSKUItem = req.body;
			await this.dao.createSKUItem(rawSKUItem);

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

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}

	// ################## Utilities

	async getSKUItemByRFIDInternal(rfid) {
		const SKUItemId = rfid;

		const row = await this.dao.getSKUItemByRFID(SKUItemId);
		if (row === undefined)
			throw SKUItemErrorFactory.newSKUItemNotFound();

		const skuItem = new SKUItem(row.RFID, row.skuId, row.available, row.dateOfStock, row.restockOrderId);
		return skuItem;
	}

	async getAllSkuItemsByRestockOrder(restockOrderId) {
		const rows = await this.dao.getAllSkuItemsByRestockOrder(restockOrderId);

		const skuItems = [];

		for (let row of rows) {
			let skuItem = await this.getSKUItemByRFIDInternal(row.RFID);
			skuItems.push(skuItem);
		}

		return skuItems;
	}

	async getItemByRFIDInternal(RFID, restockOrderId) {
		const { supplierId } = await this.dao.getSupplierIdByRestockOrderId(restockOrderId);
		if (supplierId === undefined)
			throw RestockOrderErrorFactory.newRestockOrderNotFound();
		
		const row = await this.dao.getSkuAndSKUItemByRFIDInternal(RFID, supplierId);
		if (row === undefined)
			throw SKUItemErrorFactory.newSKUItemNotFound();

		return {
			SKUId: row.SKUId,
			description: row.description,
			price: row.price,
		};
	}
}

module.exports = SKUItemController;