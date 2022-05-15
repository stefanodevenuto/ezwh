const express = require('express');
const { param, body } = require("express-validator")
const TestDescriptorController = require('./controller');
const { ErrorHandler } = require("../../helper");

class TestDescriptorRoutes {
	constructor() {
		this.errorHandler = new ErrorHandler();
		this.name = 'testDescriptor';
		this.controller = new TestDescriptorController();
		this.router = express.Router();
		this.initRoutes();
	}
	

	initRoutes() {

        this.router.get(
			'/',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllTestDescriptors(req, res, next)
		);
        
        this.router.get(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getTestDescriptorByID(req, res, next)
		);

		this.router.post(
			'/',
			body('name').isString(),
			body('procedureDescription').isString(),
			body('idSKU').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createTestDescriptor(req, res, next)
		);

        
		this.router.put(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			body('newName').isString(),
			body('newProcedureDescription').isString(),
			body('newIdSKU').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyTestDescriptor(req, res, next)
		);

		this.router.delete(
			'/:id',
			param('id').isNumeric().withMessage("ERROR: id is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteTestDescriptor(req, res, next)
		);
	}
}

module.exports = TestDescriptorRoutes;