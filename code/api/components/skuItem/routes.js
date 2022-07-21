const express = require('express');
const { param, body } = require("express-validator")
const SKUItemController = require('./controller');
const { ErrorHandler } = require("../../helper");

class SKUItemRoutes {
	constructor(skuController) {
		this.errorHandler = new ErrorHandler();
		this.name = 'SKUItem';
		this.controller = new SKUItemController(skuController);
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {

        this.router.get(
			'/',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllSKUItems()
				.then((SKUItems) => res.status(200).json(SKUItems))
				.catch((err) => next(err))
		);
		
        this.router.get(
			'/:rfid',
			param('rfid').isString().isLength({min: 32, max: 32}).isLength({min: 32, max: 32}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getSKUItemByRFID(req.params.rfid)
				.then((skuItem) => res.status(200).json(skuItem))
				.catch((err) => next(err))
		);

		this.router.get(
			'/sku/:id',
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getSKUItemBySKUID(req.params.id)
				.then((SKUItems) => res.status(200).json(SKUItems))
				.catch((err) => next(err))
		);


		this.router.post(
			'/',
			body('RFID').isString().isLength({min: 32, max: 32}).isLength({min: 32, max: 32}),
			body('SKUId').isNumeric(),
			body('DateOfStock').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createSKUItem(req.body.RFID, req.body.SKUId, req.body.DateOfStock)
				.then(() => res.status(201).send())
				.catch((err) => next(err))
		);

		this.router.put(
			'/:rfid',
			param('rfid').isString().isLength({min: 32, max: 32}),
			body('newRFID').isString().isLength({min: 32, max: 32}),
			body('newAvailable').isNumeric(),
			body('newDateOfStock').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifySKUItem(req.params.rfid, req.body.newRFID, 
					req.body.newAvailable, req.body.newDateOfStock)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.delete(
			'/:rfid',
			param('rfid').isString().isLength({min: 32, max: 32}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteSKUItem(req.params.rfid)
				.then(() => res.status(204).send())
				.catch((err) => next(err))
		);
	}
}

module.exports = SKUItemRoutes;