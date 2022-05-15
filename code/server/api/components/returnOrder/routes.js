const express = require('express');
const { param, body } = require("express-validator")
const ReturnOrderController = require('./controller');
const { ErrorHandler } = require("../../helper");

class ReturnOrderRoutes {
	constructor() {
		this.errorHandler = new ErrorHandler();
		this.name = 'returnOrder';
		this.controller = new ReturnOrderController();
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {

        this.router.get(
			'/',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllReturnOrders(req, res, next)
		);

        this.router.get(
			'/:id',
			param('id').isString().withMessage("ERROR: ReturnOrderId is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getReturnOrderByID(req, res, next)
		);

		this.router.post(
			'/',
			body("returnDate").isString(),
			body("products").isArray(),
			body("restockOrderId").isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createReturnOrder(req, res, next)
		);

		this.router.delete(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: ReturnOrderId is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteReturnOrder(req, res, next)
		);
	}
}

module.exports = ReturnOrderRoutes;