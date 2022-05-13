const ItemDAO = require('./dao');
const Item = require("./item");
const { ItemErrorFactory } = require('./error');
const Cache = require('lru-cache');

class ItemController {
	constructor() {
		this.dao = new ItemDAO();
		this.itemMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
		this.keysMapping = new Map();
		this.enableCache = (process.env.ENABLE_MAP === "true") || false;
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
			let item = this.itemMap.find( (itemValue) => itemValue.SKUId === skuId);
			if (item !== undefined)
				item.SKUId = null;
		}

		if (action === "DELETE_USER") {
			const userId = value;
			let item = this.itemMap.find( (itemValue) => itemValue.supplierId === userId);
			if (item !== undefined)
				item.supplierId = null;
		}
	}

	async getAllItems(req, res, next) {  // getAllItems
		try {
			const rows = await this.dao.getAllItems();
			
			const items = rows.map(record => new Item(
				record.id,
				record.description,
				record.price,
				record.SKUId,
				record.supplierId));
			return res.status(200).json(items);
		} catch (err) {
			return next(err);
		}
	}

	async getItemByID(req, res, next) {  // getItemByID
		try {
			const itemId = Number(req.params.id);

			if(this.enableCache) {
				const item = this.itemMap.get(Number(itemId));
				if(item !== undefined)
					return res.status(200).json(item);
			}

			const row = await this.dao.getItemByID(itemId);
			if(row === undefined)
				throw ItemErrorFactory.itemNotFound();
			
			const item = new Item(
				row.id,
				row.description,
				row.price,
				row.SKUId,
				row.supplierId);

			if(this.enableCache) {
				this.itemMap.set(item.id, item);
				this.keysMapping.set(item.id, `${item.SKUId}${item.supplierId}`);
			}
			
			return res.status(200).json(item);
		} catch (err) {
			return next(err);
		}
	}

	async createItem(req, res, next) {
		try {
			const rawItem = req.body;
			await this.dao.createItem(rawItem);

			if(this.enableCache) {
				const item = new Item(
					id,
					rawItem.description,
					rawItem.price,
					rawItem.SKUId,
					rawItem.supplierId
				);

				this.itemMap.set(Number(id), item);
				this.keysMapping.set(Number(id), `${item.SKUId}${item.supplierId}`);
			}

			return res.status(201).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("item.supplierId, item.SKUId"))
					err = ItemErrorFactory.skuAlreadyAssociatedForSupplier();
				if (err.message.includes("FOREIGN KEY"))
					err = ItemErrorFactory.newSkuOrSupplierNotFound();
				if (err.message.includes("item.id")) // Item id already used ASSUMPTION: item.id unique globally
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

			if(this.enableCache) {
				let item = this.itemMap.get(Number(itemId));

				if (item !== undefined) {
					item.description = rawItem.newDescription;
					item.price = rawItem.newPrice;
				}
			}

			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async deleteItem(req, res, next) {
		try {
			const itemId = req.params.id;

			const { changes } = await this.dao.deleteItem(itemId);
			if (changes === 0)
				throw ItemErrorFactory.itemNotFound();

			if(this.enableCache) {
				this.itemMap.delete(Number(itemId));
				this.keysMapping.delete(Number(itemId));
			}
			
			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = ItemController;