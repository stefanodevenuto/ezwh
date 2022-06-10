const UserDao = require('./dao')
const User = require("./user");
const { UserErrorFactory } = require('./error');

class UserController {
	constructor() {
		this.dao = new UserDao();
	}

	// ################################ API

	async getUserInfo() {
		const user = new User(9999, "DUMMY", "DUMMY",
			"DUMMY@DUMMY.DUMMY", "DUMMY", "DUMMY");

		return user.intoJson();
	}

	async getAllSuppliers() {
		const rows = await this.dao.getAllUsersByType(User.SUPPLIER);

		const suppliers = rows.map((row) => new User(row.id, row.name, row.surname,
			row.email, row.password, row.type).intoJson())

		return suppliers;
	}

	async getAllUsers() {
		const rows = await this.dao.getAllUsers();

		const users = rows.map((row) => new User(row.id, row.name, row.surname,
			row.email, row.password, row.type).intoJson())

		return users;
	}

	async createUser(username, name, surname, password, type) {
		try {
			if (type === User.MANAGER || type === User.ADMINISTRATOR)
				throw UserErrorFactory.newAttemptCreationPrivilegedAccount();

			if (!User.isValidType(type))
				throw UserErrorFactory.newTypeNotFound();

			await this.dao.createUser(username, name, surname, password, type);
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("user.email, user.type"))
					err = UserErrorFactory.newUserConflict();
			}

			throw err;
		}
	}

	async login(username, password, type) {
		const row = await this.dao.checkUser(username, password);
		if (row === undefined)
			throw UserErrorFactory.newWrongCredential();

		if (row.type !== type)
			return {};

		const user = {
			id: row.id,
			username: row.email,
			name: row.name
		}

		return user;
	}

	async loginManager(username, password) {
		return await this.login(username, password, User.MANAGER);
	}

	async loginCustomer(username, password) {
		return await this.login(username, password, User.CUSTOMER);
	}

	async loginSupplier(username, password) {
		return await this.login(username, password, User.SUPPLIER);
	}

	async loginClerk(username, password) {
		return await this.login(username, password, User.CLERK);
	}

	async loginQualityEmployee(username, password) {
		return await this.login(username, password, User.QUALITY_EMPLOYEE);
	}

	async loginDeliveryEmployee(username, password) {
		return await this.login(username, password, User.DELIVERY_EMPLOYEE);
	}

	async modifyRight(username, oldType, newType) {
		try {
			if (!User.isValidType(oldType) || !User.isValidType(newType))
				throw UserErrorFactory.newTypeNotFound422();

			if (oldType === User.MANAGER || oldType === User.ADMINISTRATOR)
				throw UserErrorFactory.newAttemptCreationPrivilegedAccount();

			const user = await this.dao.getUserByEmailAndType(username, oldType);
			if (user === undefined)
				throw UserErrorFactory.newUserNotFound();

			const { changes } = await this.dao.modifyRight(username, oldType, newType);
			if (changes === 0)
				throw UserErrorFactory.newAttemptCreationPrivilegedAccount();
		} catch (err) {
			if (err.code === "SQLITE_CONSTRAINT") {
				if (err.message.includes("user.email, user.type"))
					err = UserErrorFactory.newUserConflict();
			}

			throw err;
		}
	}

	async deleteUser(username, type) {
		if (type === User.MANAGER || type === User.ADMINISTRATOR)
			throw UserErrorFactory.newAttemptCreationPrivilegedAccount();

		if (!User.isValidType(type))
			throw UserErrorFactory.newTypeNotFound422();

		await this.dao.deleteUser(username, type);
	}
}

module.exports = UserController;