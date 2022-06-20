const RestockOrderDAO = require('../api/components/restock_order/dao');
const ItemDAO = require('../api/components/item/dao');
const SkuDAO = require('../api/components/sku/dao');
const UserDAO = require('../api/components/user/dao');
const SKUItemDAO = require('../api/components/skuItem/dao');

const RestockOrder = require('../api/components/restock_order/restockOrder');
const Item = require('../api/components/item/item');
const Sku = require('../api/components/sku/sku');
const User = require('../api/components/user/user');
const SKUItem = require('../api/components/skuItem/SKUItem');

describe("Testing RestockOrderDAO", () => {
    const restockOrderDao = new RestockOrderDAO();
    const itemDao = new ItemDAO();
    const skuDao = new SkuDAO();
    const userDao = new UserDAO();
    const skuItemDao = new SKUItemDAO();

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

        // Setup Items
        await itemDao.createItem(testItem.id, testItem.description, testItem.price, 
            testSku.id, testUser.id);
        testItem.SKUId = testSku.id;
        testItem.supplierId = testUser.id;

        await itemDao.createItem(secondTestItem.id, secondTestItem.description, secondTestItem.price, 
            secondTestSku.id, testUser.id);
        secondTestItem.SKUId = secondTestSku.id;
        secondTestItem.supplierId = testUser.id;

        // Setup Restock Order
        testRestockOrder.supplierId = testUser.id;
        testRestockOrder.products = [
            {item: testItem, qty: 10},
            {item: secondTestItem, qty: 10}
        ];
    });

    test("Create a Restock Order", async () => {
        const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, testRestockOrder.supplierId,
            testRestockOrder.state, testRestockOrder.products);
        testRestockOrder.id = restockOrderId;

        const result = await restockOrderDao.getRestockOrderByID(testRestockOrder.id);
        expect(result).toHaveLength(2);
        
        for (let i = 0; i < result.length; i++) {
            expect(result[i].id).toStrictEqual(testRestockOrder.id);
            expect(result[i].issueDate).toStrictEqual(testRestockOrder.issueDate);
            expect(result[i].state).toStrictEqual(testRestockOrder.state);
            expect(result[i].supplierId).toStrictEqual(testRestockOrder.supplierId);
            expect(result[i].deliveryDate).toStrictEqual(null);

            expect(result[i].SKUId).toStrictEqual(testRestockOrder.products[i].item.SKUId);
            expect(result[i].description).toStrictEqual(testRestockOrder.products[i].item.description);
            expect(result[i].price).toStrictEqual(testRestockOrder.products[i].item.price);
            expect(result[i].qty).toStrictEqual(testRestockOrder.products[i].qty);
        }
    });

    describe("Modify State", () => {
        beforeEach(async () => {
            const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, testRestockOrder.supplierId,
                testRestockOrder.state, testRestockOrder.products);
            testRestockOrder.id = restockOrderId;
        });

        test("Modify State of inexistent Restock Order", async () => {
            const { changes } = await restockOrderDao.modifyState(-1, RestockOrder.TESTED);
            expect(changes).toStrictEqual(0);
        })

        test("Modify State of Restock Order", async () => {
            const { changes } = await restockOrderDao.modifyState(testRestockOrder.id, RestockOrder.TESTED);
            expect(changes).toStrictEqual(1);

            const result = await restockOrderDao.getRestockOrderByID(testRestockOrder.id);
            expect(result[0].state).toStrictEqual(RestockOrder.TESTED);
        })
    });

    describe("Modify Sku Items list", () => {
        beforeEach(async () => {
            const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, 
                testRestockOrder.supplierId, testRestockOrder.state, testRestockOrder.products);
            testRestockOrder.id = restockOrderId;

            testSkuItem.SKUId = testSku.id;
            secondTestSkuItem.SKUId = secondTestSku.id;

            await skuItemDao.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock);
            await skuItemDao.createSKUItem(secondTestSkuItem.RFID, secondTestSkuItem.SKUId, secondTestSkuItem.dateOfStock);

            testRestockOrder.skuItems = [testSkuItem, secondTestSkuItem];
        });

        test("Modify Sku Item list with valid Sku Items", async () => {
            const { changes } = await restockOrderDao.modifyRestockOrderSkuItems(testRestockOrder.id, 
                testRestockOrder.skuItems.map((s) => ({rfid: s.RFID})));
            expect(changes).toStrictEqual(2);
        })

        test("Modify Sku Item list of inexistent Restock Order", async () => {
            expect.assertions(2);
            try {
                await restockOrderDao.modifyRestockOrderSkuItems(-1, 
                    testRestockOrder.skuItems.map((s) => ({rfid: s.RFID})));
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("FOREIGN");
            }
        })

        test("Modify Sku Item list with inexistent Sku Items", async () => {
            const { changes } = await restockOrderDao.modifyRestockOrderSkuItems(testRestockOrder.id, [
                {rfid: "-1"},
                {rfid: "-2"},
            ]);
            expect(changes).toStrictEqual(0);
        })

        afterEach(async () => {
            await skuItemDao.deleteSKUItem(testSkuItem.RFID);
            await skuItemDao.deleteSKUItem(secondTestSkuItem.RFID);
        });
    });

    describe("Modify Transport Note", () => {
        beforeEach(async () => {
            const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, 
                testRestockOrder.supplierId, testRestockOrder.state, testRestockOrder.products);
            testRestockOrder.id = restockOrderId;
        });

        test("Modify Transport Note with Delivery Date before Issue Date", async () => {
            expect.assertions(2);
            try {
                await restockOrderDao.modifyTransportNote(testRestockOrder.id, "1980/03/03");
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("deliveryDate");
            }
        })

        test("Modify Transport Note of inexistent Restock Order", async () => {
            const { changes } = await restockOrderDao.modifyTransportNote(-1, "2222/03/03");
            expect(changes).toStrictEqual(0);
        })

        test("Modify with valid Transport Note", async () => {
            const { changes } = await restockOrderDao.modifyTransportNote(testRestockOrder.id, "2222/03/03");
            expect(changes).toStrictEqual(1);
        })
    });

    describe("Delete Restock Order", () => {
        beforeEach(async () => {
            const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, 
                testRestockOrder.supplierId, testRestockOrder.state, testRestockOrder.products);
            testRestockOrder.id = restockOrderId;
        });

        test("Delete Restock Order with inexistent id", async () => {
            const { changes } = await restockOrderDao.deleteRestockOrder(-1);
            expect(changes).toStrictEqual(0);
        })

        test("Delete valid Restock Order", async () => {
            const { changes } = await restockOrderDao.deleteRestockOrder(testRestockOrder.id)
            expect(changes).toStrictEqual(1);
        })
    });

    afterEach(async () => {
        await skuDao.deleteSku(testSku.id);
        await skuDao.deleteSku(secondTestSku.id);
        await userDao.deleteUser(testUser.email, testUser.type);
        await itemDao.deleteItem(testItem.id);
        await itemDao.deleteItem(secondTestItem.id);
        await restockOrderDao.deleteRestockOrder(testRestockOrder.id);
    })

});
