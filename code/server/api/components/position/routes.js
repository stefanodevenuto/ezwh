const express = require('express');
const { param, body } = require("express-validator")
const PositionController = require('./controller');
const { ErrorHandler } = require("../../helper");

class PositionRoutes {
	constructor() {
		this.errorHandler = new ErrorHandler();
		this.name = 'position';
		this.controller = new PositionController();
		this.router = express.Router();
		this.initRoutes();
	}


	initRoutes() {

        this.router.get(
			'/',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllPositions(req, res, next)
		);

        this.router.get(
			'/:id',
			param('id').isString().withMessage("ERROR: PositionId is not a String"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getPositionByID(req, res, next)
		);

		this.router.post(
			'/',
			body("positionID").isString().isLength({min: 12, max: 12}),
			body("aisleID").isString().isLength({min: 4, max: 4}),
			body("row").isString().isLength({min: 4, max: 4}),
			body("col").isString().isLength({min: 4, max: 4}),
			body("maxWeight").isNumeric(),
			body("maxVolume").isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createPosition(req, res, next)
		);

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
	}
}

module.exports = PositionRoutes;