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

		/*
		this.router.put(
			'/:positionID',
			param('positionID').isString().withMessage("ERROR: PositionId is not a String"),
			body("newAisleID").isString().isLength({min: 4, max: 4}),
			body("newRow").isString().isLength({min: 4, max: 4}),
			body("newCol").isString().isLength({min: 4, max: 4}),
			body("newMaxWeight").isNumeric(),
			body("newMaxVolume").isNumeric(),
            body("newOccupiedWeight").isNumeric(),
			body("newOccupiedVolume").isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyPosition(req, res, next)
		);

		this.router.put(
			'/:positionID/changeID',
			param('positionID').isString().withMessage("ERROR: PositionId is not a String"),
			body("newPositionID").isString().isLength({min: 12, max: 12}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyPositionID(req, res, next)
		);

		this.router.delete(
			'/:positionID',
			param('positionID').isNumeric().withMessage("ERROR: PositionId is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deletePosition(req, res, next)
		);
        */
	}
}

module.exports = RestockOrderRoutes;