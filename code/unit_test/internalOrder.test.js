const InternalOrderDao = require('../api/components/internalOrder/dao');
const SkuDAO = require('../api/components/sku/dao');
const UserDAO = require('../api/components/user/dao');
const SKUItemDAO = require('../api/components/skuItem/dao');

const InternalOrder = require('../api/components/internalOrder/internalOrder');
const User = require('../api/components/user/user');
const Sku = require('../api/components/sku/sku');
const SKUItem = require('../api/components/skuItem/SKUItem');

const InternalOrderController = require('../api/components/internalOrder/controller');

describe("Testing InternalOrderDao", () => {

    const internalOrderDao = new InternalOrderDao();
    const skuDao = new SkuDAO();
    const userDao = new UserDAO();
    const skuItemDao = new SKUItemDAO();

    let testInternalOrder = InternalOrder.mockTestInternalOrder();
    let testUser = User.mockUserCustomer();

    let testSkuItem = SKUItem.mockTestSkuItem();
    let secondTestSkuItem = SKUItem.mockTestSkuItem();
    secondTestSkuItem.RFID = testSkuItem.RFID.replace(/.$/,"2")

    let testSku = Sku.mockTestSku();
    let secondTestSku = Sku.mockTestSku();

    beforeAll(async () => {
        await internalOrderDao.deleteAllInternalOrder();
        await skuDao.deleteAllSKU();
        await userDao.deleteAllUser();
        await skuItemDao.deleteAllSKUItem();
    });

    beforeEach(async () => {
        // Setup Skus
        const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
            testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
        testSku.id = skuId;

        const { id: secondSkuId } = await skuDao.createSku(secondTestSku.description, secondTestSku.weight,
            secondTestSku.volume, secondTestSku.notes, secondTestSku.price, secondTestSku.availableQuantity);
        secondTestSku.id = secondSkuId;

        // Setup User
        const { id: userId } = await userDao.createUser(testUser.email, testUser.name, 
            testUser.surname, testUser.password, testUser.type)
        testUser.id = userId;

        // Setup Internal Order
        testInternalOrder.customerId = testUser.id;
        testInternalOrder.products = [
            { SKUId: testSku.id, description: testSku.description, price: testSku.price, qty: 10 },
            { SKUId: secondTestSku.id, description: secondTestSku.description, price: secondTestSku.price, qty: 10 }
        ];
    });

    describe("Create Internal Order", () => {
        test("Create Internal Order with inexistent customer", async () => {
            expect.assertions(2);
            try {
                await internalOrderDao.createInternalOrder(testInternalOrder.issueDate, 
                    -1, testInternalOrder.state, testInternalOrder.products);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("FOREIGN");
            }
        })

        test("Create Internal Order with inexistent Sku", async () => {
            expect.assertions(2);
            try {
                await internalOrderDao.createInternalOrder(testInternalOrder.issueDate, testInternalOrder.customerId, 
                    testInternalOrder.state, [{SKUId: -1, qty: 10}]);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("FOREIGN");
            }
        })

        test("Create valid Internal Order", async () => {
            const internalOrderId = await internalOrderDao.createInternalOrder(testInternalOrder.issueDate, testInternalOrder.customerId, 
                testInternalOrder.state, testInternalOrder.products);
            testInternalOrder.id = internalOrderId;

            const result = await internalOrderDao.getInternalOrderByID(testInternalOrder.id);
            expect(result).toHaveLength(2);
            
            for (let i = 0; i < result.length; i++) {
                expect(result[i].id).toStrictEqual(testInternalOrder.id);
                expect(result[i].issueDate).toStrictEqual(testInternalOrder.issueDate);
                expect(result[i].state).toStrictEqual(testInternalOrder.state);
                expect(result[i].customerId).toStrictEqual(testInternalOrder.customerId);

                expect(result[i].SKUId).toStrictEqual(testInternalOrder.products[i].SKUId);
                expect(result[i].description).toStrictEqual(testInternalOrder.products[i].description);
                expect(result[i].price).toStrictEqual(testInternalOrder.products[i].price);
                expect(result[i].qty).toStrictEqual(testInternalOrder.products[i].qty);
                expect(result[i].RFID).toStrictEqual(null);
            }            
        })

        afterEach(async () => {
            await internalOrderDao.deleteAllInternalOrder();
        });
      
    });

    describe("Modify Internal Order", () => {
        beforeEach(async () => {
            const internalOrderId = await internalOrderDao.createInternalOrder(testInternalOrder.issueDate, 
                testInternalOrder.customerId, InternalOrder.ISSUED, testInternalOrder.products)
            testInternalOrder.id = internalOrderId;

            await skuItemDao.createSKUItem(testSkuItem.RFID, testSku.id, testSkuItem.dateOfStock);
            await skuItemDao.createSKUItem(secondTestSkuItem.RFID, secondTestSku.id, 
                secondTestSkuItem.dateOfStock);

            testSkuItem.SKUId = testSku.id;
            secondTestSkuItem.SKUId = secondTestSku.id;
        });

        test("Modify inexistent Internal Order", async () => {
            const changes = await internalOrderDao.modifyStateInternalOrder(-1, testInternalOrder.state, 
                testInternalOrder.products);
            expect(changes).toStrictEqual(0);
        });

        test("Modify Internal Order into COMPLETED state with inexistent Sku Items", async () => {
            const changes = await internalOrderDao.modifyStateInternalOrder(testInternalOrder.id, InternalOrder.COMPLETED,
                testInternalOrder.products.map((p) => ({SKUId: p.SKUId, RFID: "-1"})))
            expect(changes).toStrictEqual(1);
        })

        test("Modify Internal Order into a basic state ", async () => {
            const changes = await internalOrderDao.modifyStateInternalOrder(testInternalOrder.id, InternalOrder.ACCEPTED);
            expect(changes).toStrictEqual(1);
        })

        test("Modify Internal Order into COMPLETED state with valid Sku Items", async () => {
            const changes = await internalOrderDao.modifyStateInternalOrder(testInternalOrder.id, 
                InternalOrder.COMPLETED, [
                    {SKUId: testSkuItem.SKUId, RFID: testSkuItem.RFID},
                    {SKUId: secondTestSkuItem.SKUId, RFID: secondTestSkuItem.RFID}
                ]);
            expect(changes).toStrictEqual(3);
        });
          
        afterEach(async () => {
            await skuItemDao.deleteAllSKUItem();
            await internalOrderDao.deleteAllInternalOrder();
        });
    });


    describe("Delete Internal Order", () => {
        beforeEach(async () => {
            const internalOrderId = await internalOrderDao.createInternalOrder(testInternalOrder.issueDate, 
                testInternalOrder.customerId, InternalOrder.ISSUED, testInternalOrder.products)
            testInternalOrder.id = internalOrderId;
        });

        test("Delete inexistent Internal Order", async () => {
            const { changes } = await internalOrderDao.deleteInternalOrder(-1);
            expect(changes).toStrictEqual(0);
        });

        test("Delete Internal Order after create",async () => {
            const { changes } = await internalOrderDao.deleteInternalOrder(testInternalOrder.id);
            expect(changes).toStrictEqual(1);
        });

        afterEach( async () => {
            await internalOrderDao.deleteAllInternalOrder();
        });
    })

    afterEach(async () => {
        await skuDao.deleteAllSKU();
        await userDao.deleteAllUser();
    });
})
