const express = require('express');
const { param, body } = require("express-validator")
const ItemController = require('./controller');	//before: ./item
const { ErrorHandler } = require("../../helper");	//ok

class ItemRoutes {      // ok
	constructor() {
		this.errorHandler = new ErrorHandler();
		this.name = 'item';
		this.controller = new ItemController();
		this.router = express.Router();
		this.initRoutes();
	}

	async initMap() {	//ok
		await this.controller.initMap();
	} 

	initRoutes() {

        this.router.get(	//ok
			'/',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllItems(req, res, next)
		);
		
        this.router.get(	//ok
			'/:id',
			param('id').isNumeric().withMessage("ERROR: ItemId is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getItemByID(req, res, next)
		);

		this.router.post(
			'/',
			body('description').isString(),
			body('price').isDecimal(),
			body('SKUId').isNumeric(),
			body('supplierId').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createItem(req, res, next)
		);

		this.router.put(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			body('newDescription').isString(),
			body('newPrice').isDecimal(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyItem(req, res, next)
		);

		this.router.delete(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteItem(req, res, next)
		);
	}
}

module.exports = ItemRoutes;