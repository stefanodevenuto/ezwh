const express = require('express');
const { param, body } = require("express-validator")
const TestResultController = require('./controller');
const { ErrorHandler } = require("../../helper");

class TestResultRoutes {
	constructor(skuItemController) {
		this.errorHandler = new ErrorHandler();
		this.name = 'testResult';
		this.controller = new TestResultController(skuItemController);
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

        
		this.router.post(
			'/testResults',
			body('rfid').isString().isLength({min: 32, max: 32}),
			body('idTestDescriptor').isNumeric(),
			body('Date').isDate(),
			body('Result').isBoolean(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createTestResult(req, res, next)
		);

		this.router.put(
			'/:rfid/testResult/:id',
			param('rfid').isString().isLength({min: 32, max: 32}),
			param('id').isString(),
			body('newIdTestDescriptor').isNumeric(),
			body('newDate').isDate(),
			body('newResult').isBoolean(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyTestResult(req, res, next)
		);

		this.router.delete(
			'/:rfid/testResult/:id',
			param('rfid').isString().isLength({min: 32, max: 32}),
			param('id').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteTestResult(req, res, next)
		);
	}
}

module.exports = TestResultRoutes;