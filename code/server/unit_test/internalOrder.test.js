const InternalOrderDao = require('../api/components/internalOrder/dao');
const SkuDAO = require('../api/components/sku/dao');
const UserDAO = require('../api/components/user/dao');

const InternalOrder = require('../api/components/internalOrder/internalOrder');

const InternalOrderController = require('../api/components/internalOrder/controller');

describe("Testing InternalOrderDao", () => {

    const internalOrderDao = new InternalOrderDao();
    const skuDao = new SkuDAO();
    const userDao = new UserDAO();

    const internalOrderController = new InternalOrderController();

    let testInternalOrder2 = InternalOrder.mockTestInternalOrder2();
    let testInternalOrder = InternalOrder.mockTestInternalOrder();


    beforeAll(async () => {
        await internalOrderDao.deleteAllInternalOrder();
        //await skuDao.deleteAllSKU();
        await userDao.getUserByID(testInternalOrder.customerId);
        await userDao.getUserByID(testInternalOrder2.customerId);

    });

    beforeAll(async () => {
        
        for(let row of testInternalOrder.products){
               let sku = await skuDao.getSkuByID(row.SKUId);
               if(sku === undefined){
                    sku = await skuDao.createSku(row);
                    row.SKUId = sku.id;
               }
            }

            for(let row of testInternalOrder2.products){
                let sku = await skuDao.getSkuByID(row.SKUId);
                if(sku === undefined){
                     sku = await skuDao.createSku(row);
                     row.SKUId = sku.id;
                }
             }
        
    });

    describe("Create Internal Order", () => {


        test("Create Internal Order after check SKUId", async () => {

            
                let row = await internalOrderDao.createInternalOrder(testInternalOrder.issueDate,testInternalOrder.customerId,  testInternalOrder.state, testInternalOrder.products);
                testInternalOrder.id = row;
                let result = await internalOrderDao.getInternalOrderByID(row);
                result = await internalOrderController.buildInternalOrders(result);

                expect(result[0].issueDate).toStrictEqual(testInternalOrder.issueDate);
                expect(result[0].state).toStrictEqual(testInternalOrder.state);
                //expect(result.products).toStrictEqual(testInternalOrder.products);
                expect(result[0].customerId).toStrictEqual(testInternalOrder.customerId);
        });

        afterAll(async () => {
            await internalOrderDao.deleteAllInternalOrder();
           
        });
      
    });


    describe("Modify Internal Order", () => {

        beforeAll(async () => {
            let row = await internalOrderDao.createInternalOrder(testInternalOrder.issueDate,testInternalOrder.customerId, testInternalOrder.state, testInternalOrder.products);
            testInternalOrder.id = row;
         });


        test("Modify inexistent Internal Order", async () => {
            const changes = await internalOrderDao.modifyStateInternalOrder(-1, testInternalOrder.state, testInternalOrder.products);

            expect(changes).toStrictEqual(0);
        });
    
            test("Modify Internal Order ACCEPTED", async () => {
    
                let internalOrderMod = {
                    newState: "ACCEPTED"
                };
                
                    const changes = await internalOrderDao.modifyStateInternalOrder(testInternalOrder.id, internalOrderMod.newState, undefined);    
                    expect(changes).toStrictEqual(1);

                    testInternalOrder.state = internalOrderMod.newState;
    
                    let result = await internalOrderDao.getInternalOrderByID(testInternalOrder.id);
                    result = await internalOrderController.buildInternalOrders(result);
                    console.log(result)
    
                    expect(result[0].state).toStrictEqual(internalOrderMod.newState);    
                
            });

            test("Modify Internal Order COMPLETED", async () => {
    
                let internalOrderMod = {
                    newState: "COMPLETED",
                    products:   [{"SkuID":testInternalOrder2.products[0].SKUId,"RFID":"12345678901234567890123456789016"},
                                {"SkuID":testInternalOrder2.products[1].SKUId,"RFID":"12345678901234567890123456789038"}]
                };
               
                const changes = await internalOrderDao.modifyStateInternalOrder(testInternalOrder.id, internalOrderMod.newState, undefined);    
                expect(changes).toStrictEqual(1);

                testInternalOrder.state = internalOrderMod.newState;

                let result = await internalOrderDao.getInternalOrderByID(testInternalOrder.id);
                result = await internalOrderController.buildInternalOrders(result);
                console.log(result)

                expect(result[0].state).toStrictEqual(internalOrderMod.newState);    
                
            });

            /*afterEach(async () => {
                await internalOrderDao.deleteAllInternalOrder();
                
            });*/
          
        });



    describe("Delete Internal Order", () => {
       
        beforeEach(async () => {
            let row = await internalOrderDao.createInternalOrder(testInternalOrder.issueDate,testInternalOrder.customerId,  testInternalOrder.state, testInternalOrder.products);
            testInternalOrder.id = row;

        });

        test("Delete inexistent Internal Order", async () => {
            const { changes } = await internalOrderDao.deleteInternalOrder(-1);
            expect(changes).toStrictEqual(0);
        });


        test("Delete Internal Order after create",async () => {
            const { changes } = await internalOrderDao.deleteInternalOrder(testInternalOrder.id);
            expect(changes).toStrictEqual(1);

        });
        
    
    })






})
