const sqlite3 = require("sqlite3");
var CryptoJS = require("crypto-js");
const AppDAO = require("../../../db/AppDAO.js");

class UserDao extends AppDAO{

    constructor() { super(); }
    
    async getAllSuppliers() {
        const query = 'SELECT * FROM user WHERE type = ?';
        return await this.all(query, ["supplier"]);
    }

    async getAllUsers() {
        const query = 'SELECT * FROM user WHERE type != ?';
        return await this.all(query, ["manager"]);
    }

    async getSKUItemByRFID(RFID) {
        const query = 'SELECT * FROM skuItem WHERE RFID = ?';
        let row = await this.get(query, [RFID]);

        return row;
    }


    async getSKUItemBySKUID(SKUId) {
        const query = 'SELECT * FROM skuItem WHERE skuId = ? AND available = ?';
        let row = await this.get(query, [SKUId, 1]);

        return row;
    }

    async createUser(User) {
        const query = 'INSERT INTO user(name, surname, email, password, type) VALUES (?, ?, ?, ?, ?)'
        let lastId = await this.run(query, [User.name, User.surname, User.username, CryptoJS.MD5(User.password), User.type]);
        
        return lastId;
    }

    async checkManager(email, password) {
        const query = 'SELECT id, email, password FROM user WHERE email = ? AND password = ? AND type = ?'
        let row = await this.get(query, [email, CryptoJS.MD5(password), "manager"]);

        return row;
    }

    async checkCustomer(email, password) {
        const query = 'SELECT id, email, password FROM user WHERE email = ? AND password = ? AND type = ?'
        let row = await this.get(query, [email, CryptoJS.MD5(password), "customer"]);

        return row;
    }


    async checkSupplier(email, password) {
        const query = 'SELECT id, email, password FROM user WHERE email = ? AND password = ? AND type = ?'
        let row = await this.get(query, [email, CryptoJS.MD5(password), "supplier"]);

        return row;
    }


    async checkClerk(email, password) {
        const query = 'SELECT id, email, password FROM user WHERE email = ? AND password = ? AND type = ?'
        let row = await this.get(query, [email, CryptoJS.MD5(password), "clerk"]);

        return row;
    }


    async checkQualityEmployee(email, password) {
        const query = 'SELECT id, email, password FROM user WHERE email = ? AND password = ? AND type = ?'
        let row = await this.get(query, [email, CryptoJS.MD5(password), "qualityEmployee"]);

        return row;
    }


    async checkDeliveryEmployee(email, password) {
        const query = 'SELECT id, email, password FROM user WHERE email = ? AND password = ? AND type = ?'
        let row = await this.get(query, [email, CryptoJS.MD5(password), "deliveryEmployee"]);

        return row;
    }



    async modifyRight(username, User) {
        const query = 'UPDATE user SET type = ? WHERE email = ? AND type = ?'
        await this.run(query, [User.newType, username, User.oldType]);
    }


    async deleteUser(userUsername, userType) {
        const query = 'DELETE FROM user WHERE email = ? AND type = ?'
        await this.run(query, [userUsername, userType]);
    }
}

module.exports = UserDao;
