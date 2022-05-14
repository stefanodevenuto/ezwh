const express = require('express');
const { param, body, checkSchema } = require("express-validator")
const RestockOrderController = require('./controller');
const { ErrorHandler } = require("../../helper");
const RestockOrder = require("./restockOrder");

class RestockOrderRoutes {
	constructor(testResultController, skuItemController, itemController) {
		this.errorHandler = new ErrorHandler();
		this.name = 'restockOrder';
		this.controller = new RestockOrderController(testResultController, skuItemController, itemController);
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {

        this.router.get(
			'/restockOrdersIssued',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllIssuedRestockOrders(req, res, next)
		);

        this.router.get(
			'/',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllRestockOrders(req, res, next)
		);
        
        this.router.get(
			'/:id',
			param('id').isString().withMessage("ERROR: Restock Order ID is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getRestockOrderByID(req, res, next)
		);

		this.router.get(
			'/:id/returnItems',
			param('id').isString().withMessage("ERROR: Restock Order ID is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getRestockOrderReturnItemsByID(req, res, next)
		);

		this.router.post(
			'/',
			body("issueDate").isString(),
			body("products").isArray(),
			body("supplierId").isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createRestockOrder(req, res, next)
		);

		this.router.put(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			body("newState").isString()
				.custom((state) => RestockOrder.isValidState(state))
				.withMessage("Invalid State"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyState(req, res, next)
		);

		this.router.put(
			'/:id/skuItems',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			body("skuItems").isArray(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyRestockOrderSkuItems(req, res, next)
		);

		this.router.put(
			'/:id/transportNote',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			body("transportNote.deliveryDate").isDate(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyTransportNote(req, res, next)
		);

		this.router.delete(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteRestockOrder(req, res, next)
		);
	}
}

module.exports = RestockOrderRoutes;