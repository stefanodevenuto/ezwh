const InternalOrderController = require('../../api/components/internalOrder/controller');
const SkuController = require('../../api/components/sku/controller');
const UserController = require('../../api/components/user/controller');

const InternalOrder = require('../../api/components/internalOrder/internalOrder');
const Sku = require('../../api/components/sku/sku');
const User = require('../../api/components/user/user');


describe("Internal Order Controller suite", () => {

    const skuController = new SkuController();
    const internalOrderController = new InternalOrderController();
    const userController = new UserController();

    let testSku = Sku.mockTestSku();
    let testInternalOrder = InternalOrder.mockTestInternalOrder();

    let testUser = User.mockUserCustomer();   
            
    beforeAll(async () => {
        await internalOrderController.dao.deleteAllInternalOrder();

        const { id } = await userController.dao.createUser(testUser.email, testUser.name, 
            testUser.surname, "PASSWORD", testUser.type)
        testInternalOrder.customerId = id;       
        //await skuController.dao.deleteAllSKU();
    });

    beforeAll(async () => {
        for(let row of testInternalOrder.products){
            let r = await skuController.dao.createSku(row);
            row.SKUId = r.id;
        }
        
        const internalOrderId = await internalOrderController.dao.createInternalOrder(testInternalOrder.issueDate,testInternalOrder.customerId,
                                                                                                    testInternalOrder.state, testInternalOrder.products);
        testInternalOrder.id = internalOrderId;

    });

   

    describe("Get Internal Orders", () => {

        test("Get All Internal Orders", async () => {
            const result = await internalOrderController.dao.getAllInternalOrders();
           
            expect(result).toHaveLength(2);

            expect(result[0].issueDate).toStrictEqual(testInternalOrder.issueDate);
            expect(result[0].state).toStrictEqual(testInternalOrder.state);
            //expect(result[0].products).toMatchObject(testInternalOrder.products);
            expect(result[0].customerId).toStrictEqual(testInternalOrder.customerId);
          });

        test("Get Internal Order by ID", async () => {
          
            let result = await internalOrderController.getInternalOrderByIDInternal(testInternalOrder.id);
           
            console.log(result)
            //expect(result[0]).toMatchObject(testInternalOrder);

            expect(result[0].issueDate).toStrictEqual(testInternalOrder.issueDate);
            expect(result[0].state).toStrictEqual(testInternalOrder.state);
            //expect(result[0].products).toStrictEqual(testInternalOrder.products);
            expect(result[0].customerId).toStrictEqual(testInternalOrder.customerId);
         });

        /* test("Get Internal Order ISSUED", async () => {
            const result = await internalOrderController.getInternalOrdersIssued()
            expect(result).toBeDefined();

            expect(result.issueDate).toStrictEqual(testInternalOrder.issueDate);
            expect(result.state).toStrictEqual(testInternalOrder.state);
            //expect(result.products).toStrictEqual(testInternalOrder.products);
            expect(result.customerId).toStrictEqual(testInternalOrder.customerId);
         });*/

         /*test("Get Internal Order ISSUED", async () => {
            const result = await internalOrderController.getInternalOrdersAccepted()
            expect(result).toBeDefined();

            expect(result.issueDate).toStrictEqual(testInternalOrder.issueDate);
            expect(result.state).toStrictEqual(testInternalOrder.state);
            //expect(result.products).toStrictEqual(testInternalOrder.products);
            expect(result.customerId).toStrictEqual(testInternalOrder.customerId);
         });*/

         afterAll(async () => {
            await internalOrderController.dao.deleteAllInternalOrder();
            //for(let row of testInternalOrder.products)
               // await skuController.dao.deleteSku(row.SkuID);
        });



    })

    describe("Create Internal Order", () => {
       
        test("Create valid Internal Order", async () => {
            await expect(internalOrderController.createInternalOrder(testInternalOrder.issueDate, testInternalOrder.products, 
                                                        testInternalOrder.customerId))
                .resolves
                .not.toThrowError()
        });

        afterAll(async () => {
            await internalOrderController.dao.deleteAllInternalOrder();
        });


       
    });

    describe("Modify Internal Order", () => {

        beforeEach(async () => {
            await internalOrderController.createInternalOrder(testInternalOrder.issueDate, testInternalOrder.products, 
                testInternalOrder.customerId)
        })
      
        test("Modify inexistent Internal Order", async () => {
            await expect(internalOrderController.modifyStateInternalOrder(-1, testInternalOrder.state, testInternalOrder.products))
                .rejects
                .toThrow()
        });

        test("Modify state Internal Order ACCEPTED", async () => {
            let internalOrderMod = {
                newState: "ACCEPTED"
            }
            await expect(internalOrderController.modifyStateInternalOrder(testInternalOrder.id, internalOrderMod.newState, undefined))
                .rejects
                .toThrow()

        });

        test("Modify state Internal Order COMPLETED", async () => {
            let internalOrderMod = {
                newState: "ACCEPTED",
                products:[{"SkuID":1,"RFID":"12345678901234567890123456789016"},{"SkuID":1,"RFID":"12345678901234567890123456789038"}]
            }
            await expect(internalOrderController.modifyStateInternalOrder(testInternalOrder.id, internalOrderMod.newState, internalOrderMod.products))
                .rejects
                .toThrow()
        });

        /*afterEach(async () => {
            await internalOrderController.dao.deleteAllInternalOrder();
        });*/


    });

    describe("Delete internal Order", () => {

       beforeEach(async () => {
            await internalOrderController.createInternalOrder(testInternalOrder.issueDate, testInternalOrder.products, 
                testInternalOrder.customerId)
        })

        test("Delete inexistent internal Order", async () => {
            await expect(internalOrderController.deleteInternalOrder(-1))
                .resolves
               // .toThrow(InternalOrderErrorFactory.newInternalOrderNotFound())
        });

        test("Delete internal Order", async () => {
            await expect(internalOrderController.deleteInternalOrder(testInternalOrder.id))
                .resolves
                //.toThrow(InternalOrderErrorFactory.newInternalOrderNotFound())
                
        });

        afterEach(async () => {
            await internalOrderController.dao.deleteAllInternalOrder();
        });
    })

    afterAll(async () => {
        await userController.dao.deleteAllUser();
    });

})