const express = require('express');
const { param, body } = require("express-validator")
const UserController = require('./controller');
const { ErrorHandler } = require("../../helper");
const User = require('./user');

class UserRoutes {
	constructor() {
		this.errorHandler = new ErrorHandler();
		this.name = 'User';
		this.controller = new UserController();
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {
		this.router.get(
			'/userinfo',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getUserInfo()
				.then((user) => res.status(200).json(user))
				.catch((err) => next(err))
		);

		this.router.get(
			'/suppliers',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllSuppliers()
				.then((suppliers) => res.status(200).json(suppliers))
				.catch((err) => next(err))
		);

		this.router.get(
			'/users',
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllUsers()
				.then((users) => res.status(200).json(users))
				.catch((err) => next(err))
		);

		this.router.post(
			'/newUser',
			body('username').isString(),
			body('name').isString(),
			body('surname').isString(),
			body('password').isString().isLength({min:8}),
			body('type').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createUser(req.body.username, req.body.name,
					req.body.surname, req.body.password, req.body.type)
				.then(() => res.status(201).send())
				.catch((err) => next(err))
		);

		this.router.post(
			'/managerSessions',
			body('username').isString(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginManager(req.body.username, req.body.password)
				.then((user) => res.status(200).send(user))
				.catch((err) => next(err))
		);

		this.router.post(
			'/customerSessions',
			body('username').isEmail(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginCustomer(req.body.username, req.body.password)
				.then((user) => res.status(200).send(user))
				.catch((err) => next(err))
		);

		this.router.post(
			'/supplierSessions',
			body('username').isEmail(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginSupplier(req.body.username, req.body.password)
				.then((user) => res.status(200).send(user))
				.catch((err) => next(err))
		);

		this.router.post(
			'/clerkSessions',
			body('username').isEmail(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginClerk(req.body.username, req.body.password)
				.then((user) => res.status(200).send(user))
				.catch((err) => next(err))
		);

		this.router.post(
			'/qualityEmployeeSessions',
			body('username').isEmail(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginQualityEmployee(req.body.username, req.body.password)
				.then((user) => res.status(200).send(user))
				.catch((err) => next(err))
		);

		this.router.post(
			'/deliveryEmployeeSessions',
			body('username').isEmail(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginDeliveryEmployee(req.body.username, req.body.password)
				.then((user) => res.status(200).send(user))
				.catch((err) => next(err))
		);

		this.router.put(
			'/users/:username',
			param('username').isEmail(),
			body('oldType').isString().isIn(['customer', 'manager', 'clerk', 'supplier', 'administrator', 'INTERNAL_CUSTOMER', 'qualityEmployee', 'deliveryEmployee']),
			body('newType').isString().isIn(['customer', 'manager', 'clerk', 'supplier', 'administrator', 'INTERNAL_CUSTOMER', 'qualityEmployee', 'deliveryEmployee']),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyRight(req.params.username, 
					req.body.oldType, req.body.newType)
				.then(() => res.status(200).send())
				.catch((err) => next(err))
		);

		this.router.delete(
			'/users/:username/:type',
			param('username').isEmail(),
			param('type').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteUser(req.params.username, req.params.type)
				.then(() => res.status(204).send())
				.catch((err) => next(err))
		);
	}
}

module.exports = UserRoutes;