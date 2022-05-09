const express = require('express');
const { param, body } = require("express-validator")
const TestResultController = require('./controller');
const { ErrorHandler } = require("../../helper");

class TestResultRoutes {
	constructor() {
		this.errorHandler = new ErrorHandler();
		this.name = 'sku';
		this.controller = new TestResultController();
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {

        this.router.get(
			'/:rfid/testResults',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllTestResults(req, res, next)
		);
		
        this.router.get(
			'/:rfid/testResults/:id',
			param('rfid').isString().withMessage("ERROR: RFID is not a string"),
			param('id').isNumeric().withMessage("ERROR: testResultId is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getTestResultByID(req, res, next)
		);

        /*
		this.router.post(
			'/',
			body('description').isString(),
			body('weight').isNumeric(),
			body('volume').isNumeric(),
			body('notes').isString(),
			body('price').isDecimal(),
			body('availableQuantity').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createSku(req, res, next)
		);

		this.router.put(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			body('newDescription').isString(),
			body('newWeight').isNumeric(),
			body('newVolume').isNumeric(),
			body('newNotes').isString(),
			body('newPrice').isDecimal(),
			body('newAvailableQuantity').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifySku(req, res, next)
		);

		this.router.put(
			'/:id/position',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			body('position').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.addModifySkuPosition(req, res, next)
		);

		this.router.delete(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteSku(req, res, next)
		);*/
	}
}

module.exports = TestResultRoutes;