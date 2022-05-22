var CryptoJS = require("crypto-js");

class User {
    static ADMINISTRATOR     = "administrator";
    static MANAGER           = "manager";
    static INTERNAL_CUSTOMER = "INTERNAL_CUSTOMER";
    static CUSTOMER          = "customer";
    static SUPPLIER          = "supplier";
    static CLERK             = "clerk";
    static QUALITY_EMPLOYEE  = "qualityEmployee";
    static DELIVERY_EMPLOYEE = "deliveryEmployee";

    static TYPES = [
        this.MANAGER, this.CUSTOMER, this.SUPPLIER, this.CLERK, 
        this.QUALITY_EMPLOYEE, this.DELIVERY_EMPLOYEE, this.INTERNAL_CUSTOMER
    ]

    constructor(id = null, name, surname, email, password, type) {
        this.id = id;
        this.name = name,
        this.surname = surname,
        this.email = email,
        this.password = CryptoJS.MD5(password),
        this.type = type
    }

    static isValidType(type) {
        return this.TYPES.some((t) => t === type);
    }

    intoJson() {
        return {
            id: this.id,
            name: this.name,
            surname: this.surname,
            email: this.email,
            type: this.type
        }        
    }
}

module.exports = User;

