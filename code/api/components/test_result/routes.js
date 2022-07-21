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
			param('rfid').isString().isLength({min: 32, max: 32}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllTestResults(req.params.rfid)
				.then((testResults) => res.status(200).json(testResults))
				.catch((err) => next(err))
		);
		
        this.router.get(
			'/:rfid/testResults/:id',
			param('rfid').isString().isLength({min: 32, max: 32}),
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getTestResultByID(req.params.rfid, req.params.id)
				.then((testResult) => res.status(200).json(testResult))
				.catch((err) => next(err))
		);

		this.router.post(
			'/testResult',
			body('rfid').isString().isLength({min: 32, max: 32}),
			body('idTestDescriptor').isNumeric(),
			body('Date').isDate(),
			body('Result').isBoolean(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createTestResult(req.body.rfid, 
					req.body.idTestDescriptor, req.body.Date, req.body.Result)
				.then(() => res.status(201).send())
				.catch((err) => next(err))
		);

		
		this.router.put(
			'/:rfid/testResult/:id',
			param('rfid').isString().isLength({min: 32, max: 32}),
			param('id').isString(),
			body('newIdTestDescriptor').isNumeric(),
			body('newDate').isDate(),
			body('newResult').isBoolean(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyTestResult(req.params.rfid, req.params.id,
					req.body.newIdTestDescriptor, req.body.newDate, req.body.newResult)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.delete(
			'/:rfid/testResult/:id',
			param('rfid').isString().isLength({min: 32, max: 32}),
			param('id').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteTestResult(req.params.rfid, req.params.id)
				.then(() => res.status(204).send())
				.catch((err) => next(err))
		);
	}
}

module.exports = TestResultRoutes;