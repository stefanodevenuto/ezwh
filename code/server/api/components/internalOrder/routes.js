const express = require('express');
const { param, body } = require("express-validator")
const InternalOrderController = require('./controller');
const { ErrorHandler } = require("../../helper");

class InternalOrderRoutes {
	constructor() {
		this.errorHandler = new ErrorHandler();
		this.name = 'internalOrder';
		this.controller = new InternalOrderController();
		this.router = express.Router();
		this.initRoutes();
	}

	async initMap() {
		await this.controller.initMap();
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
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getInternalOrdersAccepted(req, res, next)
		);

		this.router.get(
			'/internalOrdersIssued',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getInternalOrdersIssued(req, res, next)
		);

        this.router.get(
			'/internalOrders/:id',
			param('id').isString().withMessage("ERROR: PositionId is not a String"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getInternalOrderByID(req, res, next)
		);

		this.router.post(
			'/internalOrders',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createInternalOrder(req, res, next)
		);

		this.router.put(
			'/internalOrders/:id',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyStateInternalOrder(req, res, next)
		);

		this.router.delete(
			'/internalOrders/:id',
			param('id').isNumeric().withMessage("ERROR: PositionId is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteInternalOrder(req, res, next)
		);
	}
}

module.exports = InternalOrderRoutes;