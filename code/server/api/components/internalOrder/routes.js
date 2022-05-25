const express = require('express');
const { param, body } = require("express-validator")
const InternalOrderController = require('./controller');
const { ErrorHandler } = require("../../helper");

class InternalOrderRoutes {
	constructor(skuController) {
		this.errorHandler = new ErrorHandler();
		this.name = 'internalOrder';
		this.controller = new InternalOrderController(skuController);
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {
        this.router.get(
			'/internalOrders',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllInternalOrders()
				.then((internalOrders) => res.status(200).json(internalOrders))
				.catch((err) => next(err))
		);

		this.router.get(
			'/internalOrdersAccepted',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getInternalOrdersAccepted()
				.then((acceptedInternalOrders) => res.status(200).json(acceptedInternalOrders))
				.catch((err) => next(err))
		);

		this.router.get(
			'/internalOrdersIssued',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getInternalOrdersIssued()
				.then((issuedInternalOrders) => res.status(200).json(issuedInternalOrders))
				.catch((err) => next(err))
		);

        this.router.get(
			'/internalOrders/:id',
			param('id').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getInternalOrderByID(req.params.id)
				.then((internalOrder) => res.status(200).json(internalOrder))
				.catch((err) => next(err))
		);

		this.router.post(
			'/internalOrders/',
			body("issueDate").isString(),
			body("products").isArray(),
			body("customerId").isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createInternalOrder(req.body.issueDate, 
					req.body.products, req.body.customerId)
				.then(() => res.status(201).send())
				.catch((err) => next(err))
		);

		this.router.put(
			'/internalOrders/:id',
			param('id').isNumeric().withMessage("ERROR: InternalOrderId is not a number"),
			body("newState").isString(),
			body("products").isArray().optional({nullable: true}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyStateInternalOrder(req.params.id, 
					req.body.newState, req.body.products)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.delete(
			'/internalOrders/:id',
			param('id').isNumeric().withMessage("ERROR: InternalOrderId is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteInternalOrder(req.params.id)
				.then(() => res.status(204).send())
				.catch((err) => next(err))
		);
	}
}

module.exports = InternalOrderRoutes;