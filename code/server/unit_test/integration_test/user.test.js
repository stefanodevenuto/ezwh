const UserController = require('../../api/components/user/controller');

const User = require('../../api/components/user/user');

const { UserErrorFactory } = require('../../api/components/user/error');

describe("User Controller suite", () => {

    const userController = new UserController();

    let testUser = User.mockUser();
    let testUserCustomer = User.mockUserCustomer();
    let testUserClerk = User.mockUserClerk();
    let testUserManager = User.mockUserManager();
    let testUserQualityEmployee = User.mockUserQualityEmployee();
    let testUserDeliveryEmployee = User.mockUserDeliveryEmployee();
    let testUserInternalCustomer = User.mockUserInternalCustomer();
    let testUserAdministrator = User.mockUserAdministrator();

            
    beforeAll(async () => {
        await userController.dao.deleteAllUser();
    });


    beforeAll(async () => {
        const { id: userID } = await userController.dao.createUser(testUser.email, testUser.name, testUser.surname, testUser.password, testUser.type);
        testUser.id = userID;
        const { id: customerID } = await userController.dao.createUser(testUserCustomer.email, testUserCustomer.name, testUserCustomer.surname, testUserCustomer.password, testUserCustomer.type);
        testUserCustomer.id = customerID
        const { id: managerID } = await userController.dao.createUser(testUserManager.email, testUserManager.name, testUserManager.surname, testUserManager.password, testUserManager.type);
        testUserManager.id = managerID;
        const { id: administratorID } = await userController.dao.createUser(testUserAdministrator.email, testUserAdministrator.name, testUserAdministrator.surname, testUserAdministrator.password, testUserAdministrator.type);
        testUserAdministrator.id = administratorID
        const { id: QEID } = await userController.dao.createUser(testUserQualityEmployee.email, testUserQualityEmployee.name, testUserQualityEmployee.surname, testUserQualityEmployee.password, testUserQualityEmployee.type);
        testUserQualityEmployee.id = QEID;
        const { id: DEID } = await userController.dao.createUser(testUserDeliveryEmployee.email, testUserDeliveryEmployee.name, testUserDeliveryEmployee.surname, testUserDeliveryEmployee.password, testUserDeliveryEmployee.type);
        testUserDeliveryEmployee.id = DEID
        const { id: ICID } = await userController.dao.createUser(testUserInternalCustomer.email, testUserInternalCustomer.name, testUserInternalCustomer.surname, testUserInternalCustomer.password, testUserInternalCustomer.type);
        testUserInternalCustomer.id = ICID;
        const { id: clerkID } = await userController.dao.createUser(testUserClerk.email, testUserClerk.name, testUserClerk.surname, testUserClerk.password, testUserClerk.type);
        testUserClerk.id = clerkID
    });


    describe("Login", () => {
        test("Login Supplier", async () => {
            try{
                await userController.loginSupplier(testUser.email, testUser.password)
            } catch(err){
                let error = UserErrorFactory.newWrongCredential();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        })
        test("Login Customer", async () => {
            try{
                await userController.loginCustomer(testUserCustomer.email, testUserCustomer.password)
            } catch(err){
                let error = UserErrorFactory.newWrongCredential();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        })

        test("Login Manager", async () => {
            try{
                await userController.loginManager(testUserManager.email, testUserManager.password)
            } catch(err){
                let error = UserErrorFactory.newWrongCredential();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        })

        test("Login Quality Office", async () => {
            try{
                await userController.loginQualityEmployee(testUserQualityEmployee.email, testUserQualityEmployee.password)
            } catch(err){
                let error = UserErrorFactory.newWrongCredential();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        })

        test("Login Delivery Office", async () => {
            try{
                await userController.loginDeliveryEmployee(testUserDeliveryEmployee.email, testUserDeliveryEmployee.password)
            } catch(err){
                let error = UserErrorFactory.newWrongCredential();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        })
        test("Login Quality Office", async () => {
            try{
                await userController.loginClerk(testUserClerk.email, testUserClerk.password)
            } catch(err){
                let error = UserErrorFactory.newWrongCredential();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        })
        afterAll(async () => {
            await userController.dao.deleteAllUser();
        });
    })

    describe("Get Users", () => {
        beforeAll(async () => {
            const { id: userID } = await userController.dao.createUser(testUser.email, testUser.name, testUser.surname, testUser.password, testUser.type);
            testUser.id = userID;
            const { id: customerID } = await userController.dao.createUser(testUserCustomer.email, testUserCustomer.name, testUserCustomer.surname, testUserCustomer.password, testUserCustomer.type);
            testUserCustomer.id = customerID
    
         });

       
        test("Get All Users", async () => {
            const result = await userController.getAllUsers();
            expect(result).toHaveLength(2);

            expect(result[0].id).toStrictEqual(testUser.id);
            expect(result[0].email).toStrictEqual(testUser.email);
            expect(result[0].name).toStrictEqual(testUser.name);
            expect(result[0].surname).toStrictEqual(testUser.surname);
            expect(result[0].type).toStrictEqual(testUser.type);

            expect(result[1].id).toStrictEqual(testUserCustomer.id);
            expect(result[1].email).toStrictEqual(testUserCustomer.email);
            expect(result[1].name).toStrictEqual(testUserCustomer.name);
            expect(result[1].surname).toStrictEqual(testUserCustomer.surname);
            expect(result[1].type).toStrictEqual(testUserCustomer.type);
        });

        test("Get All Suppliers", async () => {
            const result = await userController.getAllSuppliers()
            expect(result).toHaveLength(1);

            expect(result[0].id).toStrictEqual(testUser.id);
            expect(result[0].email).toStrictEqual(testUser.email);
            expect(result[0].name).toStrictEqual(testUser.name);
            expect(result[0].surname).toStrictEqual(testUser.surname);
        });

        afterAll(async () => {
            await userController.dao.deleteAllUser();
        });

    })

    describe("Create User", () => {
       

        test("Create valid User", async () => {
            try{
                await userController.createUser(testUser.email, testUser.name, testUser.surname, testUser.password, testUser.type)
            } catch(err){
                let error = UserErrorFactory.newUserNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Create the same User two time", async () => {
            try{
                await userController.createUser(testUser.email, testUser.name, testUser.surname, testUser.password, testUser.type)
            } catch(err){
                let error = UserErrorFactory.newUserConflict();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        afterAll(async () => {
            await userController.dao.deleteAllUser();
        });


    });

    describe("Modify SKU", () => {


        beforeAll(async () => {
            const { id: userID } = await userController.dao.createUser(testUser.email, testUser.name, testUser.surname, testUser.password, testUser.type);
            testUser.id = userID;
            const { id: customerID } = await userController.dao.createUser(testUserCustomer.email, testUserCustomer.name, testUserCustomer.surname, testUserCustomer.password, testUserCustomer.type);
            testUserCustomer.id = customerID
    
         });

        test("Modify inexistent User", async () => {
            try{
                await userController.modifyRight("null", testUser.type, User.CUSTOMER)
            } catch (err) {
                let error = UserErrorFactory.newUserNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
            
        });

        test("Modify valid User with inexistent type", async () => {
            try{
                await userController.modifyRight(testUser.email, testUser.type, "NULL")
            } catch (err) {
                let error = UserErrorFactory.newTypeNotFound422();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
            
        });

        test("Modify valid User", async () => {
            try{
                await userController.modifyRight(testUser.email, testUser.type, User.CLERK)
            } catch (err) {
                let error = UserErrorFactory.newUserNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
            
        });

        test("Check valid User", async () => {
            try{
                await userController.loginCustomer(testUser.email, testUser.password)
            } catch (err) {
                let error = UserErrorFactory.newUserNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        })

        test("Check invalid User", async () => {
            try{
                await userController.loginCustomer(testUser.email, "ajdsnjdsan")
            } catch (err) {
                let error = UserErrorFactory.newWrongCredential();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        })




    });

    describe("Delete User", () => {

        test("Delete inexistent user", async () => {
            try{
                await userController.deleteUser(undefined, User.CUSTOMER)
            } catch (err) {
                let error = UserErrorFactory.newUserNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Delete User", async () => {
            try{
                await userController.deleteUser(testUser.email, testUser.type)
            } catch (err) {
                let error = UserErrorFactory.newUserNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });
    })

})