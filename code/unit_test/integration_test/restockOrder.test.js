const RestockOrderController = require('../../api/components/restock_order/controller');
const ItemController = require('../../api/components/item/controller');
const SkuController = require('../../api/components/sku/controller');
const UserController = require('../../api/components/user/controller');
const SKUItemController = require('../../api/components/skuItem/controller');
const TestResultController = require('../../api/components/test_result/controller');

const RestockOrder = require('../../api/components/restock_order/restockOrder');
const Item = require('../../api/components/item/item');
const Sku = require('../../api/components/sku/sku');
const User = require('../../api/components/user/user');
const SKUItem = require('../../api/components/skuItem/SKUItem');

const { ItemErrorFactory } = require('../../api/components/item/error');
const { RestockOrderErrorFactory } = require('../../api/components/restock_order/error');
const { SKUItemErrorFactory } = require('../../api/components/skuItem/error');

describe("Testing RestockOrderController", () => {
    const itemController = new ItemController();
    const skuController = new SkuController();
    const userController = new UserController();
    const skuItemController = new SKUItemController(skuController);
    const testResultController = new TestResultController(skuItemController);
    const restockOrderController = new RestockOrderController(testResultController, 
        skuItemController, itemController);

    let testUser = User.mockUser();
    let testSku = Sku.mockTestSku();
    let secondTestSku = Sku.mockTestSku();

    let testItem = Item.mockItem();
    let secondTestItem = Item.mockItem();
    secondTestItem.id = testItem.id + 1;

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

        // Setup Items
        await itemController.dao.createItem(testItem.id, testItem.description, testItem.price, 
            testSku.id, testUser.id);
        testItem.SKUId = testSku.id;
        testItem.supplierId = testUser.id;

        await itemController.dao.createItem(secondTestItem.id, secondTestItem.description, secondTestItem.price, 
            secondTestSku.id, testUser.id);
        secondTestItem.SKUId = secondTestSku.id;
        secondTestItem.supplierId = testUser.id;

        // Setup Restock Order
        testRestockOrder.supplierId = testUser.id;
        testRestockOrder.products = [
            {SKUId: testItem.SKUId, itemId: testItem.id, description: testItem.description, price: testItem.price, qty: 10},
            {SKUId: secondTestItem.SKUId, itemId: secondTestItem.id, description: secondTestItem.description, price: secondTestItem.price, qty: 10}
        ];
    });


    describe("Create Restock Order", () => {
        test("Create Restock Order with invalid Item", async () => {
            expect.assertions(2);
            try {
                await restockOrderController.createRestockOrder(testRestockOrder.issueDate, 
                    testRestockOrder.products.map((s) => s.SKUId = -1), testRestockOrder.supplierId);
            } catch(err) {
                let error = ItemErrorFactory.itemNotFound();
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
                    {item: testItem, qty: 10},
                    {item: secondTestItem, qty: 10}
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
                    {item: testItem, qty: 10},
                    {item: secondTestItem, qty: 10}
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
                    {item: testItem, qty: 10},
                    {item: secondTestItem, qty: 10}
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
        await itemController.dao.deleteItem(testItem.id);
        await itemController.dao.deleteItem(secondTestItem.id);
    })
});