const ItemDAO = require('./dao');
const Item = require("./item");
const { ItemErrorFactory } = require('./error');

class ItemController {
	constructor() {
		this.dao = new ItemDAO();
	}

	async getAllItems(req, res, next) {
		try {
			const rows = await this.dao.getAllItems();
			const items = rows.map(record => new Item( record.id, record.description, record.price,
				record.SKUId, record.supplierId));

			return res.status(200).json(items);
		} catch (err) {
			return next(err);
		}
	}

	async getItemByID(req, res, next) {
		try {
			const itemId = Number(req.params.id);
			let item = await this.getItemByIDInternal(itemId);
			return res.status(200).json(item);
		} catch (err) {
			return next(err);
		}
	}

	async createItem(req, res, next) {
		try {
			const rawItem = req.body;
			await this.dao.createItem(rawItem);

			return res.status(201).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("item.supplierId, item.SKUId"))
					err = ItemErrorFactory.skuAlreadyAssociatedForSupplier();
				if (err.message.includes("FOREIGN KEY"))
					err = ItemErrorFactory.newSkuOrSupplierNotFound();
				
				// ASSUMPTION from open Git Issue: item.id unique globally
				if (err.message.includes("item.id"))
					err = ItemErrorFactory.itemAlreadySoldBySupplier();
			}

			return next(err);
		}
	}

	async modifyItem(req, res, next) {
		try {
			const itemId = req.params.id;
			const rawItem = req.body;

			const { changes } = await this.dao.modifyItem(itemId, rawItem);
			if (changes === 0)
				throw ItemErrorFactory.itemNotFound();

			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async deleteItem(req, res, next) {
		try {
			const itemId = req.params.id;
			await this.dao.deleteItem(itemId);
			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}

	// ##################### Utilities

	async getItemBySkuIdAndSupplierId(skuId, supplierId) {

		const row = await this.dao.getItemBySkuIdAndSupplierId(skuId, supplierId);
		if (row === undefined)
			throw ItemErrorFactory.itemNotFound();

		const item = new Item(row.id, row.description, row.price,
			row.SKUId, row.supplierId);

		return item;
	}

	async getItemByIDInternal(itemId) {
		const row = await this.dao.getItemByID(itemId);
		if (row === undefined)
			throw ItemErrorFactory.itemNotFound();

		const item = new Item(row.id, row.description, row.price,
			row.SKUId, row.supplierId);

		return item;
	}
}

module.exports = ItemController;