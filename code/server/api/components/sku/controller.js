const SkuDAO = require('./dao')
const Sku = require("./sku");
const { SkuErrorFactory } = require('./error');
const { PositionErrorFactory } = require('../position/error');

class SkuController {
	constructor() {
		this.dao = new SkuDAO();
	}

	// ################################ API

	async getAllSkus() {
		const rows = await this.dao.getAllSkus();
		const skus = rows.map(record => new Sku(record.id, record.description, record.weight, record.volume, record.notes,
			record.positionId, record.availableQuantity, record.price, record.testDescriptor).intoJson());

		return rows;
	}

	async getSkuByID(skuId) {
		const sku = await this.getSkuByIDInternal(skuId);
		return sku.intoJson(true);
	}

	async createSku(description, weight, volume, notes, price, availableQuantity) {
		await this.dao.createSku(description, weight, volume, notes, price, availableQuantity);
	}

	async modifySku(skuId, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) {
		try {
			const totalWeight = newAvailableQuantity * newWeight;
			const totalVolume = newAvailableQuantity * newVolume;
			

			const { changes } = await this.dao.modifySku(skuId, newDescription, newWeight, newVolume, 
				newNotes, newPrice, newAvailableQuantity, totalWeight, totalVolume);
			if (changes === 0)
				throw SkuErrorFactory.newSkuNotFound();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("occupiedWeight"))
					err = PositionErrorFactory.newGreaterThanMaxWeightPosition();
				else if (err.message.includes("occupiedVolume"))
					err = PositionErrorFactory.newGreaterThanMaxVolumePosition();
				else if (err.message.includes("FOREIGN"))
					err = PositionErrorFactory.newPositionNotFound();
			}

			throw err;
		}
	}

	async addModifySkuPosition(skuId, newPosition) {
		try {
			const { changes } = await this.dao.addModifySkuPosition(skuId, newPosition);
			if (changes === 0)
				throw SkuErrorFactory.newSkuNotFound();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("No SKU associated to id"))
					err = SkuErrorFactory.newSkuNotFound();
				else if (err.message.includes("sku.positionId"))
					err = SkuErrorFactory.newPositionAlreadyOccupied();
				else if (err.message.includes("FOREIGN"))
					err = PositionErrorFactory.newPositionNotFound();
				else if (err.message.includes("occupiedWeight"))
					err = PositionErrorFactory.newGreaterThanMaxWeightPosition();
				else if (err.message.includes("occupiedVolume"))
					err = PositionErrorFactory.newGreaterThanMaxVolumePosition();
				
			}
			
			throw err;
		}
	}

	async deleteSku(skuId) {
		await this.dao.deleteSku(skuId);
	}

	// ################ Utilities

	async getSkuByIDInternal(skuId) {
		const row = await this.dao.getSkuByID(skuId);
		if (row === undefined)
			throw SkuErrorFactory.newSkuNotFound();

		let sku = new Sku(row.id, row.description, row.weight, row.volume, row.notes,
			row.positionId, row.availableQuantity, row.price, row.testDescriptor);

		return sku;
	}
}

module.exports = SkuController;