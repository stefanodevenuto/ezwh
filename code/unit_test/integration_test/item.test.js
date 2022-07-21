const ItemController = require('../../api/components/item/controller');
const UserController = require('../../api/components/user/controller');
const SkuController = require('../../api/components/sku/controller');

const Item = require('../../api/components/item/item');
const User = require('../../api/components/user/user');
const Sku = require('../../api/components/sku/sku');

const { ItemErrorFactory } = require('../../api/components/item/error');
const { SkuErrorFactory } = require('../../api/components/sku/error');

describe("Item Controller suite", () => {

    const skuController = new SkuController();
    const itemController = new ItemController(skuController);
    const userController = new UserController();

    let testItem = Item.mockItem();
    let testSku = Sku.mockTestSku();
    let testUserSupplier = User.mockUser();

    beforeAll(async () => {
        await itemController.dao.deleteAllItem();
        await userController.dao.deleteAllUser();
        await skuController.dao.deleteAllSKU();
    });


    beforeEach(async () => {
        const { id: userId } = await userController.dao.createUser(testUserSupplier.email, testUserSupplier.name,
            testUserSupplier.surname, testUserSupplier.password, testUserSupplier.type)
        testUserSupplier.id = userId;
        testItem.supplierId = userId;
        const { id: skuid } = await skuController.dao.createSku(testSku.description, testSku.weight, testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
        testSku.id = skuid;
        testItem.SKUId = skuid;
    });


    describe("Get Items", () => {
        beforeEach(async () => {
            const { id: itemId } = await itemController.dao.createItem(testItem.id, testItem.description,
                testItem.price, testItem.SKUId, testItem.supplierId);
            testItem.id = itemId;
        });

        test("Get All Items", async () => {
            const result = await itemController.getAllItems()
            expect(result).toHaveLength(1);

            expect(result[0].description).toStrictEqual(testItem.description);
            expect(result[0].price).toStrictEqual(testItem.price);
            expect(result[0].SKUId).toStrictEqual(testItem.SKUId);
            expect(result[0].supplierId).toStrictEqual(testItem.supplierId);

        });

        test("Get Item by ID", async () => {
            const result = await itemController.getItemByItemIdAndSupplierId(testItem.id, testItem.supplierId)
            expect(result).toBeDefined();

            expect(result.description).toStrictEqual(testItem.description);
            expect(result.price).toStrictEqual(testItem.price);
            expect(result.SKUId).toStrictEqual(testItem.SKUId);
            expect(result.supplierId).toStrictEqual(testItem.supplierId);
        });

        afterEach(async () => {
            await itemController.dao.deleteAllItem();
        });

    })

    describe("Create Item", () => {

        test("Create valid Item", async () => {
            await expect(itemController.createItem(testItem.id, testItem.description,
                testItem.price, testItem.SKUId, testItem.supplierId))
                .resolves
                .not.toThrowError();
        });


        test("Create valid Item with invalid SKUID", async () => {
            expect.assertions(2);
            try {
                await itemController.createItem(testItem.id, testItem.description,
                    testItem.price, -1, testItem.supplierId);
            } catch (err) {
                let error = SkuErrorFactory.newSkuNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });


        test("Create valid Item with invalid supplierID", async () => {
            expect.assertions(2);
            try {
                await itemController.createItem(testItem.id + 2, testItem.description,
                    testItem.price, testItem.SKUId, -1);
            } catch (err) {
                let error = ItemErrorFactory.newSkuOrSupplierNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        afterEach(async () => {
            await itemController.dao.deleteAllItem();
        });
    });

    describe("Modify Item", () => {
        beforeEach(async () => {
            const { id: skuId } = await skuController.dao.createSku(testSku.description, testSku.weight, testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
        });

        test("Modify inexistent Item", async () => {
            expect.assertions(2);
            try {
                await itemController.modifyItem(-1, testItem.description,
                    testItem.price);
                testItem.id = itemId;
            } catch (err) {
                let error = ItemErrorFactory.itemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        afterEach(async () => {
            await itemController.dao.deleteAllItem();
        });
    });

    describe("Delete Item", () => {

        test("Delete inexistent Item", async () => {
            await expect(itemController.deleteItem(-1))
                .resolves
                .not.toThrowError();
        });

        test("Delete valid Item", async () => {
            await expect(itemController.deleteItem(testItem.id))
                .resolves
                .not.toThrowError();
        });
    })

    afterEach(async () => {
        await itemController.dao.deleteAllItem();
        await skuController.dao.deleteAllSKU();
        await userController.dao.deleteAllUser();
    })



})