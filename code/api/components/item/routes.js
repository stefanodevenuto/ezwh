const express = require('express');
const { param, body } = require("express-validator")
const ItemController = require('./controller');
const { ErrorHandler } = require("../../helper");

class ItemRoutes {
	constructor(skuController) {
		this.errorHandler = new ErrorHandler();
		this.name = 'item';
		this.controller = new ItemController(skuController);
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {
        this.router.get(
			'/',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllItems()
				.then((items) => res.status(200).json(items))
				.catch(() => next(err))
		);
		
        this.router.get(
			'/:id/:supplierId',
			param('id').isNumeric(),
			param('supplierId').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getItemByItemIdAndSupplierId(req.params.id, req.params.supplierId)
				.then((item) => res.status(200).json(item))
				.catch((err) => next(err))
		);

		this.router.post(
			'/',
			body('id').isNumeric(),
			body('description').isString(),
			body('price').isDecimal(),
			body('SKUId').isNumeric(),
			body('supplierId').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createItem(req.body.id, req.body.description,
					req.body.price, req.body.SKUId, req.body.supplierId)
				.then(() => res.status(201).send())
				.catch((err) => next(err))
		);

		this.router.put(
			'/:id/:supplierId',
			param('id').isNumeric(),
			param('supplierId').isNumeric(),
			body('newDescription').isString(),
			body('newPrice').isDecimal(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyItem(req.params.id, req.params.supplierId,
					req.body.newDescription, req.body.newPrice)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.delete(
			'/:id/:supplierId',
			param('id').isNumeric(),
			param('supplierId').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteItem(req.params.id, req.params.supplierId)
				.then(() => res.status(204).send())
				.catch((err) => next(err))
		);
	}
}

module.exports = ItemRoutes;