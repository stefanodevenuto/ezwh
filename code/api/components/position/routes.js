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
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllPositions()
				.then((positions) => res.status(200).json(positions))
				.catch((err) => next(err))
		);

        this.router.get(
			'/:id',
			param('id').isString().withMessage("ERROR: PositionId is not a String"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getPositionByID(req.params.id)
				.then((position) => res.status(200).json(position))
				.catch((err) => next(err))
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
			(req, res, next) => this.controller.createPosition(req.body.positionID, 
					req.body.aisleID, req.body.row, req.body.col, req.body.maxWeight, 
					req.body.maxVolume)
				.then(() => res.status(201).send())
				.catch((err) => next(err))
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
			(req, res, next) => this.controller.modifyPosition(req.params.positionID,
					req.body.newAisleID, req.body.newRow, req.body.newCol, req.body.newMaxWeight,
					req.body.newMaxVolume, req.body.newOccupiedWeight, req.body.newOccupiedVolume)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.put(
			'/:positionID/changeID',
			param('positionID').isString().isLength({min: 12, max: 12}),
			body("newPositionID").isString().isLength({min: 12, max: 12}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyPositionID(req.params.positionID, req.body.newPositionID)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.delete(
			'/:positionID',
			param('positionID').isNumeric().isLength({min: 12, max: 12}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deletePosition(req.params.positionID)
				.then(() => res.status(204).send())
				.catch((err) => next(err))
		);
	}
}

module.exports = PositionRoutes;