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

	async getSkuByID(req, res, next) {
		try {
			const skuId = Number(req.params.id);

			if (this.enableCache) {
				const sku = this.skuMap.get(Number(skuId));

				if (sku !== undefined)
					return res.status(200).json(sku);
			}

			const row = await this.dao.getSkuByID(skuId);
			if (row === undefined)
				throw SkuErrorFactory.newSkuNotFound();

			let sku;
			/*let position = null;
			if (this.enableCache) {
				if (row.positionId !== null)
					position = await this.positionController.getPositionByIDInternal(row.positionId);

				sku = new Sku(row.id, row.description, row.weight, row.volume, row.notes,
					position, row.availableQuantity, row.price);
			} else {*/
				sku = new Sku(row.id, row.description, row.weight, row.volume, row.notes,
					row.positionId, row.availableQuantity, row.price);
			//}

			if (this.enableCache)
				this.skuMap.set(sku.id, sku)

			return res.status(200).json(sku);
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
			const status = await this.dao.checkManager(rawUser);

			/*if (this.enableCache) {
				const user = new User(id, rawUser.name, rawUser.surname,
					rawUser.username, rawUser.password, rawUser.type);

				this.userMap.set(Number(id), user);
			}*/

			return res.status(200).send();
		} catch (err) {
			return next(err);
		}
	}

	

	async modifySku(req, res, next) {
		try {
			const skuId = req.params.id;
			const rawSku = req.body;

			const totalWeight = rawSku.newAvailableQuantity * rawSku.newWeight;
			const totalVolume = rawSku.newAvailableQuantity * rawSku.newVolume;

			const { changes } = await this.dao.modifySku(skuId, rawSku, totalWeight, totalVolume);

			// ERROR: no SKU associated to id
			if (changes === 0)
				throw SkuErrorFactory.newSkuNotFound();

			if (this.enableCache) {
				let sku = this.skuMap.get(Number(skuId));

				if (sku !== undefined) {
					sku.description = rawSku.newDescription;
					sku.weight = rawSku.newWeight;
					sku.volume = rawSku.newVolume;
					sku.notes = rawSku.newNotes;
					sku.price = rawSku.newPrice;
					sku.availableQuantity = rawSku.newAvailableQuantity;

					this.notify({action: "UPDATE_QUANTITY", value: sku});
				}
			}

			return res.status(200).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
                if (err.message.includes("occupiedWeight"))
                    err = PositionErrorFactory.newGreaterThanMaxWeightPosition();
                else if (err.message.includes("occupiedVolume"))
                    err = PositionErrorFactory.newGreaterThanMaxVolumePosition();
            }

			return next(err);
		}
	}

	async addModifySkuPosition(req, res, next) {
		try {
			const skuId = Number(req.params.id);
			const newPosition = req.body.position;

			let skuInDB = undefined;
			if (this.enableCache) {
				let sku = this.skuMap.get(skuId);

				if (sku !== undefined)
					skuInDB = sku; 
			}

			const totalChanges = await this.dao.addModifySkuPosition(skuId, newPosition, skuInDB);

			if (totalChanges === 0)
				throw SkuErrorFactory.newSkuNotFound();

			//if (totalChanges === 1)
			//	throw PositionErrorFactory.newPositionNotFound();

			if (this.enableCache) {
				let sku = this.skuMap.get(skuId);

				if (sku !== undefined) {
					sku.positionId = newPosition;
				}
			}

			return res.status(200).send();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("sku.positionId"))
					err = SkuErrorFactory.newPositionAlreadyOccupied();
				else if(err.message.includes("FOREIGN"))
					err = PositionErrorFactory.newPositionNotFound();
				else if (err.message.includes("occupiedWeight"))
                    err = PositionErrorFactory.newGreaterThanMaxWeightPosition();
                else if (err.message.includes("occupiedVolume"))
                    err = PositionErrorFactory.newGreaterThanMaxVolumePosition();
			}
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