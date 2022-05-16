const express = require('express');
const { param, body } = require("express-validator")
const UserController = require('./controller');
const { ErrorHandler } = require("../../helper");

class UserRoutes {
	constructor() {
		this.errorHandler = new ErrorHandler();
		this.name = 'User';
		this.controller = new UserController();
		this.router = express.Router();
		this.initRoutes();
	}

	async initMap() {
		await this.controller.initMap();
	} 

	initRoutes() {

        this.router.get(
			'/users',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllUsers(req, res, next)
		);

		this.router.get(
			'/userinfo',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getUserInfo(req, res, next)
		);


		this.router.get(
			'/suppliers',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllSuppliers(req, res, next)
		);

		this.router.post(
			'/newUser',
			body('username').isString(),
			body('name').isString(),
			body('surname').isString(),
			body('password').isString().isLength({min:8}),
			body('type').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createUser(req, res, next)
		);

		this.router.post(
			'/managerSessions',
			body('username').isString(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginManager(req, res, next)
		);

		this.router.post(
			'/customerSessions',
			body('username').isString(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginManager(req, res, next)
		);

		this.router.post(
			'/supplierSessions',
			body('username').isString(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginManager(req, res, next)
		);

		this.router.post(
			'/clerkSessions',
			body('username').isString(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginManager(req, res, next)
		);

		this.router.post(
			'/qualityEmployeeSessions',
			body('username').isString(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginManager(req, res, next)
		);

		this.router.post(
			'/deliveryEmployeeSessions',
			body('username').isString(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginManager(req, res, next)
		);

		this.router.put(
			'/users/:username',
			param('username').isString().withMessage("ERROR: username is not a string"),
			body('oldType').isString(),
			body('newType').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifyRight(req, res, next)
		);

		this.router.delete(
			'/:username/:type',
			//param('rfid').isNumeric().withMessage("ERROR: RFID is not a number"),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.deleteUser(req, res, next)
		);
	}
}

module.exports = UserRoutes;