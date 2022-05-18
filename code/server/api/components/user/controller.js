const UserDao = require('./dao')
const User = require("./user");
const { UserErrorFactory } = require('./error');
const { raw } = require('express');
var CryptoJS = require("crypto-js");
const { PositionErrorFactory } = require('../position/error');



class UserController {
	constructor() {
		this.dao = new UserDao();
	}

    // ################################ API
	
	async getAllSuppliers(req, res, next) {
		try {
			const rows = await this.dao.getAllSuppliers();
		
			return res.status(200).json(rows);
		} catch (err) {
			return next(err);
		}
	}

	async getAllUsers(req, res, next) {
		try {
			const rows = await this.dao.getAllUsers();
			
			return res.status(200).json(rows);
		} catch (err) {
			return next(err);
		}
	}

	async getUserInfo(req, res, next){
		try {
			return res.status(200).send(req);
		} catch (err) {
			return next(err);
		}
	}

	async createUser(req, res, next) {
		try {
			const rawUser = req.body;
			const { id } = await this.dao.createUser(rawUser);

			return res.status(201).send();
		} catch (err) {
			return next(err);
		}
	}

	async loginManager(req, res, next) {
		try {

			const rawUser = req.body;
			
			const row = await this.dao.checkManager(rawUser.username, rawUser.password);

			if(row === undefined)
				throw PositionErrorFactory.newPositionNotFound(); // put 401

			this.getUserInfo(row, res, next);

			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async loginCustomer(req, res, next) {
		try {

			const rawUser = req.body;
			
			const row = await this.dao.checkCustomer(rawUser.username, rawUser.password);

			if(row === undefined)
				throw PositionErrorFactory.newPositionNotFound(); // put 401

			this.getUserInfo(row, res, next);

			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async loginSupplier(req, res, next) {
		try {

			const rawUser = req.body;

			const row = await this.dao.checkSupplier(rawUser.username, rawUser.password);
			

			if(row === undefined)
				throw PositionErrorFactory.newPositionNotFound(); // put 401

			this.getUserInfo(row, res, next);
			
			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async loginClerk(req, res, next) {
		try {

			const rawUser = req.body;
			
			const row = await this.dao.checkClerk(rawUser.username, rawUser.password);

			if(row === undefined)
				throw PositionErrorFactory.newPositionNotFound(); // put 401
			
			this.getUserInfo(row, res, next);

			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	async loginQualityEmployee(req, res, next) {
		try {

			const rawUser = req.body;
			
			const row = await this.dao.checkQualityEmployee(rawUser.username, rawUser.password);

			if(row === undefined)
				throw PositionErrorFactory.newPositionNotFound(); // put 401
	
			this.getUserInfo(row, res, next);
		
			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}
	
	async loginDeliveryEmployee(req, res, next) {
		try {

			const rawUser = req.body;
			
			const row = await this.dao.checkDeliveryEmployee(rawUser.username, rawUser.password);

			if(row === undefined)
				throw PositionErrorFactory.newPositionNotFound(); // put 401

			this.getUserInfo(row, res, next);
			
			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	

	async modifyRight(req, res, next) {
		try {
			const userUsername = req.params.username;
			const rawUserType = req.body;

			const id = await this.dao.modifyRight(userUsername, rawUserType);


			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}


	async deleteUser(req, res, next) {
		try {
			const userUsername = req.params.username;
			const userType = req.params.type;

			await this.dao.deleteUser(userUsername, userType);
			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = UserController;