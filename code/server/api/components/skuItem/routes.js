const express = require('express');
const { param, body } = require("express-validator")
const SKUItemController = require('./controller');
const { ErrorHandler } = require("../../helper");

class SKUItemRoutes {
	constructor() {
		this.errorHandler = new ErrorHandler();
		this.name = 'SKUItem';
		this.controller = new SKUItemController();
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
			(req, res, next) => this.controller.getAllSKUItems(req, res, next)
		);
		
        this.router.get(
			'/:rfid',
			param('rfid').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getSKUItemByRFID(req, res, next)
		);

		this.router.get(
			'/sku/:id',
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getSKUItemBySKUID(req, res, next)
		);

		this.router.post(
			'/',
			body('RFID').isString(),
			body('SKUId').isNumeric(),
			//body('Available').isNumeric(),
			body('DateOfStock').isString(),
			//body('returnOrderId').isNumeric(),
			//body('restockOrderId').isNumeric(),
			//body('internalOrderId').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createSKUItem(req, res, next)
		);

		this.router.put(
			'/:rfid',
			//param('RFID').isString().withMessage("ERROR: RFID is not a string"),
			body('newRFID').isString(),
			body('newAvailable').isNumeric(),
			//body('Available').isNumeric(),
			body('newDateOfStock').isString(),
			//body('returnOrderId').isNumeric(),
			//body('restockOrderId').isNumeric(),
			//body('internalOrderId').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifySKUItem(req, res, next)
		);

		this.router.delete(
			'/:rfid',
			param('rfid').isNumeric().withMessage("ERROR: RFID is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteSKUItem(req, res, next)
		);
	}
}

module.exports = SKUItemRoutes;