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

    async checkManager(User) {
        const query = 'SELECT id, email, password FROM user WHERE email = ? AND password = ?'
        if(await this.run(query, [User.email, CryptoJS.MD5(User.password)]) !== undefined)
            return true;
        return false;
    }


    async modifySKUItem(RFID, SKUItem) {
        const query = 'UPDATE skuItem SET RFID = ?, available = ?, dateOfStock = ? WHERE RFID = ?'
        await this.run(query, [SKUItem.newRFID, SKUItem.newAvailable,
            SKUItem.newDateOfStock, RFID]);
    }


    async deleteUser(userUsername, userType) {
        const query = 'DELETE FROM user WHERE email = ? AND type = ?'
        await this.run(query, [userUsername, userType]);
    }
}

module.exports = UserDao;
