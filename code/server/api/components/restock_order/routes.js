const express = require('express');
const { param, body } = require("express-validator")
const RestockOrderController = require('./controller');
const { ErrorHandler } = require("../../helper");

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
			(req, res, next) => this.controller.getAllIssuedRestockOrders()
				.then((issuedRestockOrders) => res.status(200).json(issuedRestockOrders))
				.catch((err) => next(err))
		);

        this.router.get(
			'/restockOrders',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllRestockOrders()
				.then((restockOrders) => res.status(200).json(restockOrders))
				.catch((err) => next(err))
		);
        
        this.router.get(
			'/restockOrders/:id',
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getRestockOrderByID(req.params.id)
				.then((restockOrder) => res.status(200).json(restockOrder))
				.catch((err) => next(err))
		);

		this.router.get(
			'/restockOrders/:id/returnItems',
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getRestockOrderReturnItemsByID(req.params.id)
				.then((returnItems) => res.status(200).json(returnItems))
				.catch((err) => next(err))
		);

		this.router.post(
			'/restockOrder',
			body("products").isArray(),
			body("supplierId").isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createRestockOrder(req.body.issueDate,
					req.body.products, req.body.supplierId)
				.then(() => res.status(201).send())
				.catch((err) => next(err))
		);

		this.router.put(
			'/restockOrder/:id',
			param('id').isNumeric(),
			body("newState").isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyState(req.params.id, req.body.newState)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.put(
			'/restockOrder/:id/skuItems',
			param('id').isNumeric(),
			body("skuItems").isArray(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyRestockOrderSkuItems(req.params.id, req.body.skuItems)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.put(
			'/restockOrder/:id/transportNote',
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyTransportNote(req.params.id, req.body.transportNote.deliveryDate)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.delete(
			'/restockOrder/:id',
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteRestockOrder(req.params.id)
				.then(() => res.status(204).send())
				.catch((err) => next(err))
		);
	}
}

module.exports = RestockOrderRoutes;