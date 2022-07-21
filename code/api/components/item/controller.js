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

	async getItemByItemIdAndSupplierId(itemId, supplierId) {
		const row = await this.dao.getItemByItemIdAndSupplierId(itemId, supplierId);
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
				if (err.message.includes("item.id, item.supplierId"))
					err = ItemErrorFactory.itemAlreadySoldBySupplier();
			}

			throw err;
		}
	}

	async modifyItem(id, supplierId, description, price) {
		const { changes } = await this.dao.modifyItem(id, supplierId, description, price);
		if (changes === 0)
			throw ItemErrorFactory.itemNotFound();
	}

	async deleteItem(id, supplierId) {
		await this.dao.deleteItem(id, supplierId);
	}
}

module.exports = ItemController;