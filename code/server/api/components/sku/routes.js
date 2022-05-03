// import { AuthService, PassportStrategy } from '../../../services/auth';


let express = require('express');
const { query, param } = require("express-validator")
let SkuController = require('./controller');

class SkuRoutes {
	constructor() {
		// this.authSerivce = new AuthService(defaultStrategy);
		this.name = 'sku';
		this.controller = new SkuController();
		console.log(this.controller);
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {

        this.router.get(
			'/',
			/* this.authSerivce.isAuthorized(),
			this.authSerivce.hasPermission(this.name, 'read'),
			this.authSerivce.validateRequest,*/
			(req, res, next) => this.controller.getAllSkus(req, res, next)
		);
		
        this.router.get(
			'/:id',
			param('id').isNumeric(),
			(req, res, next) => this.controller.getSkuByID(req, res, next, req.params.id)
		);

		/*
		this.router.post(
			'/',
			body('first_field').isEmail(),
			body('second_field').isString(),
			body('third_field').isString(),
			body('fourth_field').isBoolean(),
			this.controller.doSomething
		);
		*/
	}
}

module.exports = SkuRoutes;