const SKUItemDAO = require('./dao')
const SKUItem = require("./SKUItem");
const SkuController = require("../sku/controller");
const { SKUItemErrorFactory } = require('./error');
const { SkuErrorFactory } = require('../sku/error');
const { RestockOrderErrorFactory } = require('../restock_order/error');

class SKUItemController {
	constructor(skuController) {
		this.dao = new SKUItemDAO();
		this.skuController = skuController;
	}

	async getAllSKUItems(req, res, next) {
		const rows = await this.dao.getAllSKUItems();
		const SKUItems = rows.map(record => new SKUItem(record.RFID, record.SKUId,
			record.available, record.dateOfStock, record.restockOrderId, 
			record.returnOrderId, record.internalOrderId).intoJson());

		return SKUItems;
	}

	async getSKUItemBySKUID(skuId) {

		// To check if exists
		await this.skuController.getSkuByIDInternal(skuId);

		const rows = await this.dao.getSKUItemBySKUID(skuId);
		const SKUItems = rows.map(record => new SKUItem(record.RFID, record.SKUId,
			record.available, record.dateOfStock, record.restockOrderId).intoJson(true));

		return SKUItems;
	}

	async getSKUItemByRFID(SKUItemId) {
		const skuItem = await this.getSKUItemByRFIDInternal(SKUItemId);
		return skuItem.intoJson();
	}

	async createSKUItem(RFID, SKUId, DateOfStock) {
		try {
			// Check if exists
			await this.skuController.getSkuByID(SKUId);

			await this.dao.createSKUItem(RFID, SKUId, DateOfStock);
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("skuItem.RFID"))
					err = SKUItemErrorFactory.newSKUItemRFIDNotUnique();

			}

			throw err;
		}
	}

	async modifySKUItem(SKUItemId, newRFID, newAvailable, newDateOfStock) {
		try {
			const { changes } = await this.dao.modifySKUItem(SKUItemId, newRFID, newAvailable, newDateOfStock);
			if (changes === 0)
				throw SKUItemErrorFactory.newSKUItemNotFound();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("skuItem.RFID"))
					err = SKUItemErrorFactory.newSKUItemRFIDNotUnique();
			}

			throw err;
		}
	}

	async deleteSKUItem(SKUItemId) {
		await this.dao.deleteSKUItem(SKUItemId);
	}

	// ################## Utilities

	async getSKUItemByRFIDInternal(rfid) {
		const SKUItemId = rfid;

		const row = await this.dao.getSKUItemByRFID(SKUItemId);
		if (row === undefined)
			throw SKUItemErrorFactory.newSKUItemNotFound();

		const skuItem = new SKUItem(row.RFID, row.SKUId, row.available, row.dateOfStock, row.restockOrderId);
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
		const supplier = await this.dao.getSupplierIdByRestockOrderId(restockOrderId);
		if (supplier === undefined)
			throw RestockOrderErrorFactory.newRestockOrderNotFound();

		const row = await this.dao.getSkuAndSKUItemByRFIDInternal(RFID, supplier.supplierId);
		if (row === undefined)
			return undefined;

		return {
            itemId: row.id,
			SKUId: row.SKUId,
			description: row.description,
			price: row.price,
		};
	}
}

module.exports = SKUItemController;