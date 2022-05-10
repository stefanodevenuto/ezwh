const ItemDAO = require('./dao');
const Item = require("./item");
const { ItemErrorFactory } = require('./error');
const Cache = require('lru-cache');

class ItemController {
	constructor() {	//check
		this.dao = new ItemDAO();
		this.itemMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
		this.enableCache = (process.env.ENABLE_MAP === "true") || false;
		this.allInCache = false;
	}

	async initMap() {	// check
		const allItems = await this.dao.getAllItems()
			.catch(() => { throw ItemErrorFactory.initializeMapFailed(); });

		if (this.enableCache && allItems.length < this.itemMap.max) {
			allItems.map((item) => this.itemMap.set(item.id, item));
			this.allInCache = true;
		}
	}

	async getAllItems(req, res, next) {  // getAllItems
		try {
			if (this.enableCache && this.allInCache) {
				const allItems = Array.from(this.itemMap.values());
				return res.status(200).json(allItems);
			}
			// if cache disabled or allInCache false:
			const rows = await this.dao.getAllItems();
			const items = rows.map(record => new Item(
				record.id,
				record.description,
				record.price,
				record.SKUId,
				record.supplierId));

			if (this.enableCache && rows.length < this.skuMap.max) {
				allItems.map((item) => this.ItemMap.set(item.id, item));
				this.allInCache = true;
			}

			return res.status(200).json(items);
		} catch (err) {
			return next(err);
		}
	}

	async getItemByID(req, res, next) {  // getItemByID
		try {
			const itemId = Number(req.param.id);
			if(this.enableCache) {
				const item = this.itemMap.get(Number(itemId));
				if(item !== undefined)
					return res.status(200).json(item);
			}
		// if cache disabled, take from db
		const row = await this.dao.getItemByID(itemId);

		if(row === undefined)
			throw ItemErrorFactory.newItemNotFound();
			
		const item = new Item(
			row.id,
			row.description,
			row.price,
			row.SKUId,
			row.supplierId);

		if(this.enableCache)
			this.itemMap.set(item.id, item);
		
		return res.status(200).json(item);
		} catch (err) {
			return next(err);
		}
	}

	async createItem(req, res, next) {   // createItem
		try {
			const { id } = await this.dao.createItem(req.body);

			if(this.enableCache) {
				const item = new Item(
					id,
					description,
					price,
					SKUId,
					supplierId);

				this.itemMap.set(Number(id), item);
			}

			return res.status(201).send();
		} catch (err) {
			return next(err);
		}
	}

	async modifyItem(req, res, next) {   // modifyItem
		try {
			const itemId = req.param.id;
			const rawItem = req.body;

			if(this.enableCache) {
				let item = this.itemMap.get(Number(itemId));
				// i can change only description, price
				item.description = rawItem.newDescription;
				item.price = rawItem.newPrice;
				this.itemMap.set(Number(itemId), item);		//check
			}

			await this.dao.modifyItem(itemId, rawItem);

			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async deleteItem(req, res, next) {   // deleteItem
		try {
			const itemId = req.params.id;

			if(this.enableCache)
				this.itemMap.delete(Number(itemId));
			
			await this.dao.deleteItem(itemId);
			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = ItemController;