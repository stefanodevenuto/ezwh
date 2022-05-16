const SkuDAO = require('./dao')
const Sku = require("./sku");
const { SkuErrorFactory } = require('./error');
const { PositionErrorFactory } = require('../position/error');

class SkuController {
	constructor() {
		this.dao = new SkuDAO();
	}

	// ################################ API

	async getAllSkus(req, res, next) {
		try {
			const rows = await this.dao.getAllSkus();
			const skus = rows.map(record => new Sku(record.id, record.description, record.weight, record.volume, record.notes,
				record.positionId, record.availableQuantity, record.price, record.testDescriptor));
			return res.status(200).json(skus);
		} catch (err) {
			return next(err);
		}
	}

	async getSkuByID(req, res, next) {
		try {
			const skuId = Number(req.params.id);
			const sku = await this.getSkuByIDInternal(skuId);
			return res.status(200).json(sku);
		} catch (err) {
			return next(err);
		}
	}

	async createSku(req, res, next) {
		try {
			const rawSku = req.body;
			await this.dao.createSku(rawSku);
			return res.status(201).send();
		} catch (err) {
			return next(err);
		}
	}

	async modifySku(req, res, next) {
		try {
			const skuId = req.params.id;
			const rawSku = req.body;

			const totalWeight = rawSku.newAvailableQuantity * rawSku.newWeight;
			const totalVolume = rawSku.newAvailableQuantity * rawSku.newVolume;

			const { changes } = await this.dao.modifySku(skuId, rawSku, totalWeight, totalVolume);
			if (changes === 0)
				throw SkuErrorFactory.newSkuNotFound();

			return res.status(200).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("occupiedWeight"))
					err = PositionErrorFactory.newGreaterThanMaxWeightPosition();
				else if (err.message.includes("occupiedVolume"))
					err = PositionErrorFactory.newGreaterThanMaxVolumePosition();
			}

			return next(err);
		}
	}

	async addModifySkuPosition(req, res, next) {
		try {
			const skuId = Number(req.params.id);
			const newPosition = req.body.position;

			const totalChanges = await this.dao.addModifySkuPosition(skuId, newPosition);
			if (totalChanges === 0)
				throw SkuErrorFactory.newSkuNotFound();

			return res.status(200).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("sku.positionId"))
					err = SkuErrorFactory.newPositionAlreadyOccupied();
				else if (err.message.includes("FOREIGN"))
					err = PositionErrorFactory.newPositionNotFound();
				else if (err.message.includes("occupiedWeight"))
					err = PositionErrorFactory.newGreaterThanMaxWeightPosition();
				else if (err.message.includes("occupiedVolume"))
					err = PositionErrorFactory.newGreaterThanMaxVolumePosition();
			}
			return next(err);
		}
	}

	async deleteSku(req, res, next) {
		try {
			const skuId = req.params.id;

			const { changes } = await this.dao.deleteSku(skuId);
			if (changes === 0)
				throw SkuErrorFactory.newSkuNotFound();

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}

	// ################ Utilities

	async getSkuByIDInternal(skuId) {
		const row = await this.dao.getSkuByID(skuId);
		if (row === undefined)
			throw SkuErrorFactory.newSkuNotFound();

		let sku = new Sku(row.id, row.description, row.weight, row.volume, row.notes,
			row.positionId, row.availableQuantity, row.price, row.testDescriptorId);

		return sku;
	}
}

module.exports = SkuController;