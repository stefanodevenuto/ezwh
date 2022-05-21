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


	initRoutes() {

        this.router.get(
			'/',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllItems()
				.then((items) => res.status(200).json(items))
				.catch(() => next(err))
		);
		
        this.router.get(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: ItemId is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getItemByID(req.params.id)
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
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			body('newDescription').isString(),
			body('newPrice').isDecimal(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyItem(req.params.id,
					req.body.newDescription, req.body.newPrice)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.delete(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteItem(req.params.id)
				.then(() => res.status(204).send())
				.catch((err) => next(err))
		);
	}
}

module.exports = ItemRoutes;