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
			const suppliers = rows.map(record => new User(record.id, record.name,
				record.surname, record.password.toString(), record.email, record.type));
			return res.status(200).json(suppliers);
		} catch (err) {
			return next(err);
		}
	}

	async getAllUsers(req, res, next) {
		try {
			const rows = await this.dao.getAllUsers();
			const users = rows.map(record => new User(record.id, record.name,
				record.surname, record.password.toString(), record.email, record.type));
			return res.status(200).json(users);
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

			const { changes } = await this.dao.deleteUser(userUsername, userType);
			if (changes === 0)
				throw SkuErrorFactory.newSkuNotFound();


			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = UserController;