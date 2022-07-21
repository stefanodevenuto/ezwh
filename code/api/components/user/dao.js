var CryptoJS = require("crypto-js");
const AppDAO = require("../../../db/AppDAO.js");
const User = require('./user');

class UserDao extends AppDAO{
    async getAllUsers() {
        const query = 'SELECT id, name, surname, email, type FROM user WHERE type <> ?';
        return await this.all(query, User.MANAGER);
    }

    async getAllUsersByType(type) {
        const query = 'SELECT id, name, surname, email FROM user WHERE type = ?';
        return await this.all(query, type);
    }

    async getUserByID(id){
        const query = 'SELECT id, name, surname, email, type FROM user WHERE id = ?';
        return await this.get(query, [id]);
    }


    async createUser(username, name, surname, password, type) {
        const query = 'INSERT INTO user(name, surname, email, password, type) VALUES (?, ?, ?, ?, ?)'
        let lastId = await this.run(query, [name, surname, username, CryptoJS.MD5(password), type]);
        
        return lastId;
    }

    async checkUser(email, password) {
        const query = 'SELECT * FROM user WHERE email = ? AND password = ?'
        let row = await this.get(query, [email, CryptoJS.MD5(password)]);

        return row;
    }

    async modifyRight(username, oldType, newType) {
        const query = 'UPDATE user SET type = ? WHERE email = ? AND type = ?'
        return await this.run(query, [newType, username, oldType]);
    }


    async deleteUser(userUsername, userType) {
        const query = 'DELETE FROM user WHERE email = ? AND type = ?'
        return await this.run(query, [userUsername, userType]);
    }

    // ############# Utilities

    async getUserByEmailAndType(email, type) {
        const query = 'SELECT id, name, surname, email, type FROM user WHERE email = ? AND type = ?';
        return await this.get(query, [email, type]);
    }

    // ############# Test

    async deleteAllUser() {
        const query = 'DELETE FROM user'
        await this.run(query);
    }
}

module.exports = UserDao;
