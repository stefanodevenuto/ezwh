const express = require('express');
const { param, body } = require("express-validator")
const SkuController = require('./controller');
const { ErrorHandler } = require("../../helper");

class SkuRoutes {
	constructor(positionController) {
		this.errorHandler = new ErrorHandler();
		this.name = 'sku';
		this.controller = new SkuController(positionController);
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {
        this.router.get(
			'/',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllSkus()
				.then((skus) => res.status(200).json(skus))
				.catch((err) => next(err))
		);
		
        this.router.get(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: skuId is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getSkuByID(req.params.id)
				.then((sku) => res.status(200).json(sku))
				.catch((err) => next(err))
		);

		this.router.post(
			'/',
			body('description').isString(),
			body('weight').isNumeric(),
			body('volume').isNumeric(),
			body('notes').isString(),
			body('price').isDecimal(),
			body('availableQuantity').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createSku(req.body.description, req.body.weight, 
					req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity)
				.then(() => res.status(201).send())
				.catch((err) => next(err))
		);

		this.router.put(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			body('newDescription').isString(),
			body('newWeight').isNumeric(),
			body('newVolume').isNumeric(),
			body('newNotes').isString(),
			body('newPrice').isDecimal(),
			body('newAvailableQuantity').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifySku(req.params.id,  req.body.newDescription, 
					req.body.newWeight, req.body.newVolume, req.body.newNotes, 
					req.body.newPrice, req.body.newAvailableQuantity)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.put(
			'/:id/position',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			body('position').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.addModifySkuPosition(req.params.id, req.body.position)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.delete(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteSku(req.params.id)
				.then(() => res.status(204).send())
				.catch((err) => next(err))
		);
	}
}

module.exports = SkuRoutes;