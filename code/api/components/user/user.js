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

    static mockUser() {
        const user = new User(null, "TestTest", "TestTest", "test@test.test",
            "testtest", User.SUPPLIER);

        return user;
    }
    
    static mockUserCustomer() {
        const user = new User(null, "TestTest", "TestTest", "test@test.test",
            "testtest", User.CUSTOMER);

        return user;
    }

    static mockUserAdministrator() {
        const user = new User(null, "TestTest", "TestTest", "test@test.test",
            "testtest", User.ADMINISTRATOR);

        return user;
    }

    static mockUserManager() {
        const user = new User(null, "TestTest", "TestTest", "test@test.test",
            "testtest", User.MANAGER);

        return user;
    }

    static mockUserQualityEmployee() {
        const user = new User(null, "TestTest", "TestTest", "test@test.test",
            "testtest", User.QUALITY_EMPLOYEE);

        return user;
    }

    static mockUserInternalCustomer() {
        const user = new User(null, "TestTest", "TestTest", "test@test.test",
            "testtest", User.INTERNAL_CUSTOMER);

        return user;
    }
    static mockUserClerk() {
        const user = new User(null, "TestTest", "TestTest", "test@test.test",
            "testtest", User.CLERK);

        return user;
    }

    static mockUserDeliveryEmployee() {
        const user = new User(null, "TestTest", "TestTest", "test@test.test",
            "testtest", User.DELIVERY_EMPLOYEE);

        return user;
    }
}

module.exports = User;

