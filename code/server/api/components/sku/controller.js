//import { Sku } from './sku';
var SkuDAO = require('./dao')
var Sku = require("./sku");

class SkuController {
	constructor() {
		this.dao = new SkuDAO();
	}

	async getAllSkus(req, res, next) {
		const rows = await this.dao.getAllSkus();
		const skus = rows.map(record => new Sku(record.id, record.description, record.weight, record.volume, record.notes, 
												record.position, record.availableQuantity, record.price));

		return res.json(skus);
	}

	async getSkuByID(req, res, next, skuId) {
		const row = await this.dao.getSkuByID(skuId);
        const sku = new Sku(row.id, row.description, row.weight, row.volume, row.notes, 
                       		row.position, row.availableQuantity, row.price);

		return res.json(sku);
	}
}

module.exports = SkuController;