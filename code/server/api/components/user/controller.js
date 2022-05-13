const UserDao = require('./dao')
const User = require("./user");
const { UserErrorFactory } = require('./error');
const Cache = require('lru-cache');
const { raw } = require('express');
var CryptoJS = require("crypto-js");
//const sizeof = require('object-sizeof')

class UserController {
	constructor() {
		this.dao = new UserDao();
		this.userMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
		this.enableCache = (process.env.ENABLE_MAP === "true") || false;
		this.allInCache = false;
		this.observers = [];
	}

	addObserver(observer) {
        this.observers.push(observer);
    }

    notify(data) {
        if (this.observers.length > 0) {
            this.observers.forEach(observer => observer.update(data));
        }
    }

	update(data) {
		const { action, value: position } = data;
		if (action === "DELETE") {
			let user = this.userMap.get(position.id);
			if (user !== undefined)
				user.id = null;
		}
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

			if (this.enableCache) {
				const user = new User(id, rawUser.name, rawUser.surname,
					rawUser.username, rawUser.password, rawUser.type);

				this.userMap.set(Number(id), user);
				console.log(this.userMap);
			}

			return res.status(201).send();
		} catch (err) {
			return next(err);
		}
	}

	async loginManager(req, res, next) {
		try {
			const rawUser = req.body;
			console.log(rawUser);
			const id = await this.dao.checkManager(rawUser);

			if (this.enableCache) {
				let users = this.userMap.get(id);
				res.body = users;
				console.log(id);
			}
			

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

			if (this.enableCache) {
				let user = this.userMap.get(Number(id));

				if (user !== undefined) {
					user.type = user.newType;
			
					this.notify({action: "UPDATE_TYPE", value: user});
				}
			}

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

			if (this.enableCache) {
				this.userMap.delete(userUsername);
			}

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}

module.exports = UserController;