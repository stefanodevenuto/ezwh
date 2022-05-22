const express = require('express');
const { param, body } = require("express-validator")
const ReturnOrderController = require('./controller');
const { ErrorHandler } = require("../../helper");

class ReturnOrderRoutes {
	constructor(skuItemController) {
		this.errorHandler = new ErrorHandler();
		this.name = 'returnOrder';
		this.controller = new ReturnOrderController(skuItemController);
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {

        this.router.get(
			'/',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllReturnOrders()
				.then((returnOrders) => res.status(200).json(returnOrders))
				.catch((err) => next(err))
		);

        this.router.get(
			'/:id',
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getReturnOrderByID(req.params.id)
				.then((returnOrder) => res.status(200).json(returnOrder))
				.catch((err) => next(err))
		);

		this.router.post(
			'/',
			body("returnDate").isString(),
			body("products").isArray(),
			body("restockOrderId").isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createReturnOrder(req.body.returnDate, req.body.products, 
					req.body.restockOrderId)
				.then(() => res.status(201).send())
				.catch((err) => next(err))
		);

		this.router.delete(
			'/:id',
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteReturnOrder(req.params.id)
				.then(() => res.status(204).send())
				.catch((err) => next(err))
		);
	}
}

module.exports = ReturnOrderRoutes;