var CryptoJS = require("crypto-js");

class User {
    constructor(id = null, name, surname, email, password, type) {
                this.id = id;
                this.name = name,
                this.surname = surname,
                this.email = email,
                this.password = CryptoJS.MD5(password),
                this.type = type
        }
}


module.exports = User;

