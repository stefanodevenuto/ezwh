const UserDAO = require('../api/components/user/dao');

const User = require('../api/components/user/user');

var CryptoJS = require("crypto-js");

describe("Testing UserDAO", () => {
    const userDao = new UserDAO();

    let testUser = User.mockUser();
    let testUserCustomer = User.mockUserCustomer();

    beforeAll(async () => {
        await userDao.deleteAllUser();
    });

    test("Create User", async () => {

        const user = await userDao.createUser(testUser.email, testUser.name, testUser.surname, testUser.password, testUser.type);
        testUser.id = user.id; 

        const result = await userDao.getUserByID(testUser.id);

        expect(result.email).toStrictEqual(testUser.email);
        expect(result.name).toStrictEqual(testUser.name);
        expect(result.surname).toStrictEqual(testUser.surname);
        expect(result.type).toStrictEqual(testUser.type);
  
    });


   describe("Modify User", () => {

    test("Modify inexistent User", async () => {
        const { changes } = await userDao.modifyRight(-1, User.SUPPLIER, User.QUALITY_EMPLOYEE);
        expect(changes).toStrictEqual(0);
    });

        test("Modify User", async () => {
            
            const { changes } = await userDao.modifyRight(testUser.email, User.SUPPLIER, User.QUALITY_EMPLOYEE);
            expect(changes).toStrictEqual(1);
            
            testUser.type = User.QUALITY_EMPLOYEE;
           
            const result = await userDao.getUserByID(testUser.id);
                

            expect(result.email).toStrictEqual(testUser.email);
            expect(result.name).toStrictEqual(testUser.name);
            expect(result.surname).toStrictEqual(testUser.surname);
            expect(result.type).toStrictEqual(testUser.type);

            
        });
      
    });

    describe("Check User", () => {

        test("Check inexistent User", async () => {
            const row = await userDao.checkUser(-1, -1);
            expect(row).toStrictEqual(undefined);
        });

        test("Check inexistent User", async () => {
            const row = await userDao.checkUser(testUser.email, testUser.password);
            expect(row.email).toStrictEqual(testUser.email);
            expect(row.type).toStrictEqual(testUser.type);
        });
        
    
    })

    describe("Delete User", () => {

        test("Delete inexistent User", async () => {
            const { changes } = await userDao.deleteUser(-1);
            expect(changes).toStrictEqual(0);
        });

        test("Delete User",async () => {

            const { changes } = await userDao.deleteUser(testUser.email, testUser.type);
            expect(changes).toStrictEqual(1);
        });
        
    
    })

    


})