const RestockOrderController = require('../../api/components/restock_order/controller');
const SkuController = require('../../api/components/sku/controller');
const UserController = require('../../api/components/user/controller');
const SKUItemController = require('../../api/components/skuItem/controller');
const TestResultController = require('../../api/components/test_result/controller');

const RestockOrder = require('../../api/components/restock_order/restockOrder');
const Sku = require('../../api/components/sku/sku');
const User = require('../../api/components/user/user');
const SKUItem = require('../../api/components/skuItem/SKUItem');

const { SkuErrorFactory } = require('../../api/components/sku/error');
const { RestockOrderErrorFactory } = require('../../api/components/restock_order/error');
const { SKUItemErrorFactory } = require('../../api/components/skuItem/error');

describe("Testing RestockOrderController", () => {
    const skuController = new SkuController();
    const userController = new UserController();
    const skuItemController = new SKUItemController(skuController);
    const testResultController = new TestResultController(skuItemController);
    const restockOrderController = new RestockOrderController(testResultController, 
        skuItemController, skuController);

    let testUser = User.mockUser();
    let testSku = Sku.mockTestSku();
    let secondTestSku = Sku.mockTestSku();

    let testSkuItem = SKUItem.mockTestSkuItem();
    let secondTestSkuItem = SKUItem.mockTestSkuItem();
    secondTestSkuItem.RFID = testSkuItem.RFID.replace(/.$/,"2")

    let testRestockOrder = RestockOrder.mockRestockOrder();

    beforeAll(async () => {
        await restockOrderController.dao.deleteAllRestockOrder();
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

        // Setup Restock Order
        testRestockOrder.supplierId = testUser.id;
        testRestockOrder.products = [
            {SKUId: testSku.id, description: testSku.description, price: testSku.price, qty: 10},
            {SKUId: secondTestSku.id, description: secondTestSku.description, price: secondTestSku.price, qty: 10}
        ];
    });

    describe("Get Restock Orders", () => {
        beforeEach(async () => {
            const restockOrderId = await restockOrderController.dao.createRestockOrder(testRestockOrder.issueDate, 
                testRestockOrder.supplierId, testRestockOrder.state, [
                    {sku: testSku, qty: 10},
                    {sku: secondTestSku, qty: 10}
                ]);
            testRestockOrder.id = restockOrderId;
        });

        test("Get All Restock Orders", async () => {
            const result = await restockOrderController.getAllRestockOrders();
            expect(result).toHaveLength(1);

            expect(result[0].id).toStrictEqual(testRestockOrder.id);
            expect(result[0].issueDate).toStrictEqual(testRestockOrder.issueDate);
            expect(result[0].state).toStrictEqual(testRestockOrder.state);
            expect(result[0].customerId).toStrictEqual(testRestockOrder.customerId);

            const products = result[0].products;
            for (let i = 0; i < products.length; i++) {
                expect(products[i].SKUId).toStrictEqual(testRestockOrder.products[i].SKUId);
                expect(products[i].description).toStrictEqual(testRestockOrder.products[i].description);
                expect(products[i].price).toStrictEqual(testRestockOrder.products[i].price);
                expect(products[i].qty).toStrictEqual(testRestockOrder.products[i].qty);
            }
        });

        test("Get All ISSUED Restock Orders", async () => {
            const result = await restockOrderController.getAllIssuedRestockOrders();
            expect(result).toHaveLength(1);

            expect(result[0].id).toStrictEqual(testRestockOrder.id);
            expect(result[0].issueDate).toStrictEqual(testRestockOrder.issueDate);
            expect(result[0].state).toStrictEqual(testRestockOrder.state);
            expect(result[0].customerId).toStrictEqual(testRestockOrder.customerId);

            const products = result[0].products;
            for (let i = 0; i < products.length; i++) {
                expect(products[i].SKUId).toStrictEqual(testRestockOrder.products[i].SKUId);
                expect(products[i].description).toStrictEqual(testRestockOrder.products[i].description);
                expect(products[i].price).toStrictEqual(testRestockOrder.products[i].price);
                expect(products[i].qty).toStrictEqual(testRestockOrder.products[i].qty);
            }
        });

        test("Get Restock Order by Id", async () => {
            const result = await restockOrderController.getRestockOrderByID(testRestockOrder.id);
            expect(result).toBeDefined();

            expect(result.id).toStrictEqual(testRestockOrder.id);
            expect(result.issueDate).toStrictEqual(testRestockOrder.issueDate);
            expect(result.state).toStrictEqual(testRestockOrder.state);
            expect(result.customerId).toStrictEqual(testRestockOrder.customerId);

            const products = result.products;
            for (let i = 0; i < products.length; i++) {
                expect(products[i].SKUId).toStrictEqual(testRestockOrder.products[i].SKUId);
                expect(products[i].description).toStrictEqual(testRestockOrder.products[i].description);
                expect(products[i].price).toStrictEqual(testRestockOrder.products[i].price);
                expect(products[i].qty).toStrictEqual(testRestockOrder.products[i].qty);
            }
        });

        afterEach(async () => {
            await restockOrderController.dao.deleteAllRestockOrder();
        });
    })

    describe("Create Restock Order", () => {
        test("Create Restock Order with invalid Item", async () => {
            expect.assertions(2);
            try {
                await restockOrderController.createRestockOrder(testRestockOrder.issueDate, 
                    testRestockOrder.products.map((s) => s.SKUId = -1), testRestockOrder.supplierId);
            } catch(err) {
                let error = SkuErrorFactory.newSkuNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Create Restock Order", async () => {
            await expect(restockOrderController.createRestockOrder(testRestockOrder.issueDate, 
                testRestockOrder.products, testRestockOrder.supplierId))
                .resolves
                .not.toThrowError()
        });
    });

    describe("Modify State Restock Order", () => {
        beforeEach(async () => {
            const restockOrderId = await restockOrderController.dao.createRestockOrder(testRestockOrder.issueDate, 
                testRestockOrder.supplierId, testRestockOrder.state, [
                    {sku: testSku, qty: 10},
                    {sku: secondTestSku, qty: 10}
                ]);
            testRestockOrder.id = restockOrderId;
        });

        test("Modify State of inexistent Restock Order", async () => {
            expect.assertions(2);
            try {
                await restockOrderController.modifyState(-1, RestockOrder.TESTED);
            } catch(err) {
                let error = RestockOrderErrorFactory.newRestockOrderNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify State of valid Restock Order", async () => {
            await expect(restockOrderController.modifyState(testRestockOrder.id, RestockOrder.TESTED))
                .resolves
                .not.toThrowError();
        });
    });

    describe("Modify Sku Item list of Restock Order", () => {
        beforeEach(async () => {
            const restockOrderId = await restockOrderController.dao.createRestockOrder(testRestockOrder.issueDate, 
                testRestockOrder.supplierId, testRestockOrder.state, [
                    {sku: testSku, qty: 10},
                    {sku: secondTestSku, qty: 10}
                ]);
            testRestockOrder.id = restockOrderId;

            testSkuItem.SKUId = testSku.id;
            secondTestSkuItem.SKUId = secondTestSku.id;

            await skuItemController.dao.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock);
            await skuItemController.dao.createSKUItem(secondTestSkuItem.RFID, secondTestSkuItem.SKUId, 
                secondTestSkuItem.dateOfStock);

            testRestockOrder.skuItems = [
                {SKUId: testSkuItem.SKUId, rfid: testSkuItem.RFID},
                {SKUId: secondTestSkuItem.SKUId, rfid: secondTestSkuItem.RFID},
            ];
        });

        test("Modify Sku Item list of inexistent Restock Order", async () => {
            expect.assertions(2);
            try {
                await restockOrderController.modifyRestockOrderSkuItems(-1, testRestockOrder.skuItems)
            } catch(err) {
                let error = RestockOrderErrorFactory.newRestockOrderNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify Sku Item list of Restock Order not in DELIVERED state", async () => {
            expect.assertions(2);
            try {
                await restockOrderController.modifyRestockOrderSkuItems(testRestockOrder.id, testRestockOrder.skuItems);
            } catch(err) {
                let error = RestockOrderErrorFactory.newRestockOrderNotDelivered();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify Sku Item list of Restock Order with inexistent ones", async () => {
            await restockOrderController.dao.modifyState(testRestockOrder.id, RestockOrder.DELIVERED);
            await expect(restockOrderController.modifyRestockOrderSkuItems(testRestockOrder.id, [
                    {SKUId: testSkuItem.SKUId, rfid: "-1"},
                    {SKUId: testSkuItem.SKUId, rfid: "-2"},
                ]))
                .resolves
                .not.toThrowError();
        });

        test("Modify Sku Item list with valid Sku Items", async () => {
            await restockOrderController.dao.modifyState(testRestockOrder.id, RestockOrder.DELIVERED);
            await expect(restockOrderController.modifyRestockOrderSkuItems(testRestockOrder.id, 
                    testRestockOrder.skuItems))
                .resolves
                .not.toThrowError();
        });
    });

    describe("Modify Transport Note of Restock Order", () => {
        beforeEach(async () => {
            const restockOrderId = await restockOrderController.dao.createRestockOrder(testRestockOrder.issueDate, 
                testRestockOrder.supplierId, testRestockOrder.state, [
                    {sku: testSku, qty: 10},
                    {sku: secondTestSku, qty: 10}
                ]);
            testRestockOrder.id = restockOrderId;
        });

        test("Modify Transport Note of inexistent Restock Order", async () => {
            expect.assertions(2);
            try {
                await restockOrderController.modifyTransportNote(-1, "2022-02-02");
            } catch(err) {
                let error = RestockOrderErrorFactory.newRestockOrderNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify Transport Note of Restock Order not in DELIVERY state", async () => {
            expect.assertions(2);
            try {
                await restockOrderController.modifyTransportNote(testRestockOrder.id, "2022-02-02");
            } catch(err) {
                let error = RestockOrderErrorFactory.newRestockOrderNotDelivery();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify Transport Note with Delivery Date before Issue Date", async () => {
            expect.assertions(2);
            await restockOrderController.dao.modifyState(testRestockOrder.id, RestockOrder.DELIVERY);

            try {
                await restockOrderController.modifyTransportNote(testRestockOrder.id, "1980-02-02");
            } catch(err) {
                let error = RestockOrderErrorFactory.newRestockOrderDeliveryBeforeIssue();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify with valid Transport Note", async () => {
            await restockOrderController.dao.modifyState(testRestockOrder.id, RestockOrder.DELIVERY);
            await expect(restockOrderController.modifyTransportNote(testRestockOrder.id, "2222-02-02"))
                .resolves
                .not.toThrowError();
        });
    });

    afterEach(async () => {
        await skuController.dao.deleteSku(testSku.id);
        await skuController.dao.deleteSku(secondTestSku.id);
        await userController.dao.deleteUser(testUser.email, testUser.type);
    })
});