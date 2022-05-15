const express = require('express');
const { param, body } = require("express-validator")
const InternalOrderController = require('./controller');
const { ErrorHandler } = require("../../helper");
const InternalOrder = require("./internalOrder");

class InternalOrderRoutes {
	constructor() {
		this.errorHandler = new ErrorHandler();
		this.name = 'internalOrder';
		this.controller = new InternalOrderController();
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {

        this.router.get(
			'/internalOrders',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllInternalOrders(req, res, next)
		);

		this.router.get(
			'/internalOrdersAccepted',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getInternalOrdersAccepted(req, res, next)
		);

		this.router.get(
			'/internalOrdersIssued',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getInternalOrdersIssued(req, res, next)
		);

        this.router.get(
			'/internalOrders/:id',
			param('id').isString().withMessage("ERROR: InternalOrderId is not a String"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getInternalOrderByID(req, res, next)
		);

		this.router.post(
			'/internalOrders',
			body("issueDate").isString(),
			body("products").isArray(),
			body("customerId").isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createInternalOrder(req, res, next)
		);

		this.router.put(
			'/internalOrders/:id',
			param('id').isNumeric().withMessage("ERROR: InternalOrderId is not a number"),
			body("newState").isString()
				.custom((state) => InternalOrder.isValidState(state))
				.withMessage("Invalid State"),
			body("products").isArray().optional({nullable: true}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyStateInternalOrder(req, res, next)
		);

		this.router.delete(
			'/internalOrders/:id',
			param('id').isNumeric().withMessage("ERROR: InternalOrderId is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteInternalOrder(req, res, next)
		);
	}
}

module.exports = InternalOrderRoutes;