const express = require('express');
const dayjs = require('dayjs');
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
			'/',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllUsers(req, res, next)
		);

		this.router.get(
			'/',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),*/
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getAllSuppliers(req, res, next)
		);
		
        this.router.get(
			'/:rfid',
			param('rfid').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getSKUItemByRFID(req, res, next)
		);

		this.router.get(
			'/sku/:id',
			param('id').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.getSKUItemBySKUID(req, res, next)
		);

		/*this.router.post(
			'/',
			body('username').isString(),
			body('name').isString(),
			body('surname').isString(),
			body('password').isString().isLength({min:8}),
			body('type').isString(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.createUser(req, res, next)
		);*/

		this.router.post(
			'/',
			body('username').isString(),
			body('password').isString().isLength({min:8}),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.loginManager(req, res, next)
		);

		this.router.put(
			'/:rfid',
			//param('RFID').isString().withMessage("ERROR: RFID is not a string"),
			body('newRFID').isString(),
			body('newAvailable').isNumeric(),
			//body('Available').isNumeric(),
			body('newDateOfStock').isString(),
			//body('returnOrderId').isNumeric(),
			//body('restockOrderId').isNumeric(),
			//body('internalOrderId').isNumeric(),
			this.errorHandler.validateRequest,
			(req, res, next) => this.controller.modifySKUItem(req, res, next)
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