const express = require('express');
const { param, body } = require("express-validator")
const SkuController = require('./controller');
const { ErrorHandler } = require("../../helper");

class SkuRoutes {
	constructor() {
		this.errorHandler = new ErrorHandler();
		this.name = 'sku';
		this.controller = new SkuController(true);
		this.router = express.Router();
		this.initRoutes();
	}

	async initMap() {
		await this.controller.initMap();
	} 

	initRoutes() {

        this.router.get(
			'/',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllSkus(req, res, next)
		);
		
        this.router.get(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: skuId is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getSkuByID(req, res, next)
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
			(req, res, next) => this.controller.createSku(req, res, next)
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
			(req, res, next) => this.controller.modifySku(req, res, next)
		);

		this.router.put(
			'/:id/position',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			body('position').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.addModifySkuPosition(req, res, next)
		);

		this.router.delete(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteSku(req, res, next)
		);
	}
}

module.exports = SkuRoutes;