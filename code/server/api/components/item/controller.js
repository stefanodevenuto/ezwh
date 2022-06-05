const ItemDAO = require('./dao');
const Item = require("./item");
const { ItemErrorFactory } = require('./error');

class ItemController {
	constructor(skuController) {
		this.dao = new ItemDAO();
		this.skuController = skuController;
	}

	async getAllItems() {
		const rows = await this.dao.getAllItems();
		const items = rows.map(record => new Item(record.id, record.description, record.price,
			record.SKUId, record.supplierId));

		return items;
	}

	async getItemByID(itemId) {
		const row = await this.dao.getItemByID(itemId);
		if (row === undefined)
			throw ItemErrorFactory.itemNotFound();

		const item = new Item(row.id, row.description, row.price,
			row.SKUId, row.supplierId);

		return item;
	}

	async createItem(id, description, price, SKUId, supplierId) {
		try {
			// Check if exists
			await this.skuController.getSkuByIDInternal(SKUId)
			
			await this.dao.createItem(id, description, price, SKUId, supplierId);
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("item.supplierId, item.SKUId"))
					err = ItemErrorFactory.skuAlreadyAssociatedForSupplier();
				if (err.message.includes("FOREIGN KEY"))
					err = ItemErrorFactory.newSkuOrSupplierNotFound();

				// ASSUMPTION from open Git Issue: item.id unique globally
				//
				// Done this way because otherwise the entire Item API 
				// (as written as is now) would not work
				if (err.message.includes("item.id"))
					err = ItemErrorFactory.itemAlreadySoldBySupplier();
			}

			throw err;
		}
	}

	async modifyItem(id, description, price) {
		const { changes } = await this.dao.modifyItem(id, description, price);
		if (changes === 0)
			throw ItemErrorFactory.itemNotFound();
	}

	async deleteItem(id) {
		await this.dao.deleteItem(id);
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