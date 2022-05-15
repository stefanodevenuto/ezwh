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
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllSKUItems(req, res, next)
		);
		
        this.router.get(
			'/:rfid',
			param('rfid').isString().withMessage("ERROR: RFID is not a string"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getSKUItemByRFID(req, res, next)
		);

		this.router.get(
			'/sku/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getSKUItemBySKUID(req, res, next)
		);

		this.router.post(
			'/',
			body('RFID').isString(),
			body('SKUId').isNumeric(),
			body('DateOfStock').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createSKUItem(req, res, next)
		);

		this.router.put(
			'/:rfid',
			param('RFID').isString().withMessage("ERROR: RFID is not a string"),
			body('newRFID').isString(),
			body('newAvailable').isNumeric(),
			body('newDateOfStock').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifySKUItem(req, res, next)
		);

		this.router.delete(
			'/:rfid',
			param('rfid').isString().withMessage("ERROR: RFID is not a string"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteSKUItem(req, res, next)
		);
	}
}

module.exports = SKUItemRoutes;