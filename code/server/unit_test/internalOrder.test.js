const InternalOrderDao = require('../api/components/internalOrder/dao');
const SkuDAO = require('../api/components/sku/dao');
const UserDAO = require('../api/components/user/dao');

const InternalOrder = require('../api/components/internalOrder/internalOrder');

describe("Testing InternalOrderDao", () => {

    const internalOrderDao = new InternalOrderDao();
    const skuDao = new SkuDAO();
    const userDao = new UserDAO();

    let testInternalOrder = InternalOrder.mockTestInternalOrder2();


    beforeAll(async () => {
        await internalOrderDao.deleteAllInternalOrder();
    });


    beforeAll(async () => {
        try {
            for(row of testInternalOrder.products){
                await skuDao.getSkuByID(row.SKUId);
            }
        } catch(err) {
            expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
            expect(err.message).toMatch("id");
        }
    });

    beforeAll(async () => {

            let user = await userDao.getUserByID(testInternalOrder.customerId);

            expect(testInternalOrder.customerId).toStrictEqual(user.id);
    });

    describe("Create Internal Order", () => {


        test("Create Internal Order after check SKUId", async () => {

            
                let row = await internalOrderDao.createInternalnOrder(testInternalOrder.issueDate,testInternalOrder.customerId,  testInternalOrder.state, testInternalOrder.products);
                testInternalOrder.id = row.id;
                const result = await internalOrderDao.getInternalOrderByID(row.id);

                expect(result.issueDate).toStrictEqual(testInternalOrder.issueDate);
                expect(result.state).toStrictEqual(testInternalOrder.state);
                //expect(result.products).toStrictEqual(testInternalOrder.products);
                expect(result.customerId).toStrictEqual(testInternalOrder.customerId);
        });
      
    });


    describe("Modify Internal Order", () => {


        test("Modify inexistent Internal Order", async () => {
            const changes = await internalOrderDao.modifyStateInternalOrder(-1, testInternalOrder);

            expect(changes).toStrictEqual(0);
        });
    
            test("Modify Internal Order ACCEPTED", async () => {
    
                let internalOrderMod = {
                    newState: "ACCEPTED"
                };
                
                    const changes = await internalOrderDao.modifyStateInternalOrder(testInternalOrder.id, internalOrderMod);    
                    expect(changes).toStrictEqual(1);

                    testInternalOrder.state = internalOrderMod.newState;
    
                    const result = await internalOrderDao.getInternalOrderByID(testInternalOrder.id);
    
                    expect(result.state).toStrictEqual(internalOrderMod.newState);    
                
            });

            test("Modify Internal Order COMPLETED", async () => {
    
                let internalOrderMod = {
                    newState: "COMPLETED",
                    products:   [{"SkuID":1,"RFID":"12345678901234567890123456789016"},
                                {"SkuID":1,"RFID":"12345678901234567890123456789038"}]
                };
                
                    const changes = await internalOrderDao.modifyStateInternalOrder(testInternalOrder.id, internalOrderMod);    
                    expect(changes).toStrictEqual(1);

                    testInternalOrder.state = internalOrderMod.newState;
    
                    const result = await internalOrderDao.getInternalOrderByID(testInternalOrder.id);
    
                    expect(result.state).toStrictEqual(internalOrderMod.newState);    
                
            });
          
        });



    describe("Delete Internal Order", () => {
       

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
