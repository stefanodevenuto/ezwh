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
			(req, res, next) => this.controller.getAllTestDescriptors()
				.then((testDescriptors) => res.status(200).json(testDescriptors))
				.catch((err) => next(err))
		);
        
        this.router.get(
			'/:id',
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getTestDescriptorByID(req.params.id)
				.then((testDescriptor) => res.status(200).json(testDescriptor))
				.catch((err) => next(err))
		);

		this.router.post(
			'/',
			body('name').isString(),
			body('procedureDescription').isString(),
			body('idSKU').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createTestDescriptor(req.body.name, 
					req.body.procedureDescription, req.body.idSKU)
				.then(() => res.status(201).send())
				.catch((err) => next(err))
		);

        
		this.router.put(
			'/:id',
			param('id').isNumeric(),
			body('newName').isString(),
			body('newProcedureDescription').isString(),
			body('newIdSKU').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyTestDescriptor(req.params.id, req.body.newName, 
					req.body.newProcedureDescription, req.body.newIdSKU)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.delete(
			'/:id',
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteTestDescriptor(req.params.id)
				.then(() => res.status(204).send())
				.catch((err) => next(err))
		);
	}
}

module.exports = TestDescriptorRoutes;