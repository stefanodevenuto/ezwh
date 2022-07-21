const InternalOrderController = require('../../api/components/internalOrder/controller');
const SkuController = require('../../api/components/sku/controller');
const UserController = require('../../api/components/user/controller');
const SKUItemController = require('../../api/components/skuItem/controller');

const InternalOrder = require('../../api/components/internalOrder/internalOrder');
const Sku = require('../../api/components/sku/sku');
const User = require('../../api/components/user/user');
const SKUItem = require('../../api/components/skuItem/SKUItem');

const { SkuErrorFactory } = require('../../api/components/sku/error');
const { UserErrorFactory } = require('../../api/components/user/error');
const { InternalOrderErrorFactory } = require('../../api/components/internalOrder/error');
const { SKUItemErrorFactory } = require('../../api/components/skuItem/error');

describe("Internal Order Controller suite", () => {

    const skuController = new SkuController();
    const skuItemController = new SKUItemController(skuController);
    const internalOrderController = new InternalOrderController(skuController);
    const userController = new UserController();

    let testInternalOrder = InternalOrder.mockTestInternalOrder();

    let testSku = Sku.mockTestSku();
    let secondTestSku = Sku.mockTestSku();

    let testSkuItem = SKUItem.mockTestSkuItem();
    let secondTestSkuItem = SKUItem.mockTestSkuItem();
    secondTestSkuItem.RFID = testSkuItem.RFID.replace(/.$/,"2")

    let testUser = User.mockUserCustomer();

    beforeAll(async () => {
        await internalOrderController.dao.deleteAllInternalOrder();
        await userController.dao.deleteAllUser();
    });

    beforeEach(async () => {
        // Setup Skus
        const { id: skuId } = await skuController.dao.createSku(testSku.description, testSku.weight,
            testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
        testSku.id = skuId;

        const { id: secondSkuId } = await skuController.dao.createSku(secondTestSku.description, secondTestSku.weight,
            secondTestSku.volume, secondTestSku.notes, secondTestSku.price, secondTestSku.availableQuantity);
        secondTestSku.id = secondSkuId;

        // Setup User
        const { id: userId } = await userController.dao.createUser(testUser.email, testUser.name,
            testUser.surname, testUser.password, testUser.type)
        testUser.id = userId;

        // Setup Internal Order
        testInternalOrder.customerId = testUser.id;
        testInternalOrder.products = [
            { SKUId: testSku.id, description: testSku.description, price: testSku.price, qty: 10 },
            { SKUId: secondTestSku.id, description: secondTestSku.description, price: secondTestSku.price, qty: 10 }
        ];
    });

    describe("Get Internal Orders", () => {
        beforeEach(async () => {
            const internalOrderId = await internalOrderController.dao.createInternalOrder(testInternalOrder.issueDate,
                testInternalOrder.customerId, testInternalOrder.state, testInternalOrder.products);
            testInternalOrder.id = internalOrderId;
        });

        test("Get All Internal Orders", async () => {
            const result = await internalOrderController.getAllInternalOrders();
            expect(result).toHaveLength(1);

            expect(result[0].issueDate).toStrictEqual(testInternalOrder.issueDate);
            expect(result[0].state).toStrictEqual(testInternalOrder.state);
            expect(result[0].customerId).toStrictEqual(testInternalOrder.customerId);

            const products = result[0].products;
            for (let i = 0; i < products.length; i++) {
                expect(products[i].SKUId).toStrictEqual(testInternalOrder.products[i].SKUId);
                expect(products[i].description).toStrictEqual(testInternalOrder.products[i].description);
                expect(products[i].price).toStrictEqual(testInternalOrder.products[i].price);

                if (testInternalOrder.state === InternalOrder.COMPLETED)
                    expect(products[i].RFID).toStrictEqual(testInternalOrder.products[i].RFID);
                else
                    expect(products[i].qty).toStrictEqual(testInternalOrder.products[i].qty);
            }
        });

        test("Get All ACCEPTED Internal Orders", async () => {
            const result = await internalOrderController.getInternalOrdersAccepted();
            expect(result).toHaveLength(0);
        });

        test("Get All ISSUED Internal Orders", async () => {
            const result = await internalOrderController.getInternalOrdersIssued();
            expect(result).toHaveLength(1);

            expect(result[0].issueDate).toStrictEqual(testInternalOrder.issueDate);
            expect(result[0].state).toStrictEqual(testInternalOrder.state);
            expect(result[0].customerId).toStrictEqual(testInternalOrder.customerId);

            const products = result[0].products;
            for (let i = 0; i < products.length; i++) {
                expect(products[i].SKUId).toStrictEqual(testInternalOrder.products[i].SKUId);
                expect(products[i].description).toStrictEqual(testInternalOrder.products[i].description);
                expect(products[i].price).toStrictEqual(testInternalOrder.products[i].price);
                expect(products[i].qty).toStrictEqual(testInternalOrder.products[i].qty);
            }
        });

        test("Get Internal Order by ID", async () => {
            let result = await internalOrderController.getInternalOrderByID(testInternalOrder.id);

            expect(result.issueDate).toStrictEqual(testInternalOrder.issueDate);
            expect(result.state).toStrictEqual(testInternalOrder.state);
            expect(result.customerId).toStrictEqual(testInternalOrder.customerId);

            const products = result.products;
            for (let i = 0; i < products.length; i++) {
                expect(products[i].SKUId).toStrictEqual(testInternalOrder.products[i].SKUId);
                expect(products[i].description).toStrictEqual(testInternalOrder.products[i].description);
                expect(products[i].price).toStrictEqual(testInternalOrder.products[i].price);

                if (testInternalOrder.state === InternalOrder.COMPLETED)
                    expect(products[i].RFID).toStrictEqual(testInternalOrder.products[i].RFID);
                else
                    expect(products[i].qty).toStrictEqual(testInternalOrder.products[i].qty);
            }
        });

        afterEach(async () => {
            await internalOrderController.dao.deleteAllInternalOrder();
        });
    })

    describe("Create Internal Order", () => {
        test("Create Internal Order with invalid Sku", async () => {
            expect.assertions(2);
            try {
                await internalOrderController.createInternalOrder(testInternalOrder.issueDate, 
                    testInternalOrder.products.map((s) => s.SKUId = -1), testInternalOrder.customerId);
            } catch(err) {
                let error = SkuErrorFactory.newSkuNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Create Restock Order with inexistent Customer", async () => {
            expect.assertions(2);
            try {
                await internalOrderController.createInternalOrder(testInternalOrder.issueDate, 
                    testInternalOrder.products, -1);
            } catch(err) {
                let error = UserErrorFactory.newCustomerNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Create valid Internal Order", async () => {
            await expect(internalOrderController.createInternalOrder(testInternalOrder.issueDate, 
                testInternalOrder.products, testInternalOrder.customerId))
                .resolves
                .not.toThrowError()
        });

        afterEach(async () => {
            await internalOrderController.dao.deleteAllInternalOrder();
        });
    });

    describe("Modify Internal Order", () => {
        beforeEach(async () => {
            const internalOrderId = await internalOrderController.dao.createInternalOrder(testInternalOrder.issueDate, 
                testInternalOrder.customerId, InternalOrder.ISSUED, testInternalOrder.products)
            testInternalOrder.id = internalOrderId;

            await skuItemController.dao.createSKUItem(testSkuItem.RFID, testSku.id, testSkuItem.dateOfStock);
            await skuItemController.dao.createSKUItem(secondTestSkuItem.RFID, secondTestSku.id, 
                secondTestSkuItem.dateOfStock);

            testSkuItem.SKUId = testSku.id;
            secondTestSkuItem.SKUId = secondTestSku.id;
        })

        test("Modify inexistent Internal Order", async () => {
            expect.assertions(2);
            try {
                await internalOrderController.modifyStateInternalOrder(-1, testInternalOrder.state, testInternalOrder.products)
            } catch(err) {
                let error = InternalOrderErrorFactory.newInternalOrderNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify Internal Order into COMPLETED state without products", async () => {
            expect.assertions(2);
            try {
                await internalOrderController.modifyStateInternalOrder(testInternalOrder.id, 
                    InternalOrder.COMPLETED, undefined)
            } catch(err) {
                let error = InternalOrderErrorFactory.newInternalOrderWithNoProducts();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify Internal Order into COMPLETED state with inexistent Sku Items", async () => {
            try {
                await internalOrderController.modifyStateInternalOrder(testInternalOrder.id, 
                    InternalOrder.COMPLETED, testInternalOrder.products.map((p) => ({SKUId: p.SKUId, RFID: "-1"})));
            } catch(err) {
                let error = SKUItemErrorFactory.newSKUItemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify Internal Order into a basic state ", async () => {
            await expect(internalOrderController.modifyStateInternalOrder(testInternalOrder.id, InternalOrder.ACCEPTED))
                .resolves
                .not.toThrowError();
        });

        test("Modify Internal Order into COMPLETED state with valid Sku Items", async () => {
            await expect(internalOrderController.modifyStateInternalOrder(testInternalOrder.id, 
                InternalOrder.ACCEPTED, [
                    {SKUId: testSkuItem.SKUId, RFID: testSkuItem.RFID},
                    {SKUId: secondTestSkuItem.SKUId, RFID: secondTestSkuItem.RFID}
                ]))
                .resolves
                .not.toThrowError();
        });

        afterEach(async () => {
            await internalOrderController.dao.deleteAllInternalOrder();
            await skuItemController.dao.deleteAllSKUItem();
        })

    });

    describe("Delete Internal Order", () => {
        beforeEach(async () => {
            const internalOrderId = await internalOrderController.dao.createInternalOrder(testInternalOrder.issueDate, 
                testInternalOrder.customerId, InternalOrder.ISSUED, testInternalOrder.products)
            testInternalOrder.id = internalOrderId;
        })

        test("Delete inexistent Internal Order", async () => {
            await expect(internalOrderController.deleteInternalOrder(-1))
                .resolves
                .not.toThrowError();
        });

        test("Delete valid Internal Order", async () => {
            await expect(internalOrderController.deleteInternalOrder(testInternalOrder.id))
                .resolves
                .not.toThrowError();
        });

        afterEach( async () => {
            await internalOrderController.dao.deleteAllInternalOrder();
        });
    })

    afterEach(async () => {
        await skuController.dao.deleteAllSKU();
        await userController.dao.deleteAllUser();
    })
})