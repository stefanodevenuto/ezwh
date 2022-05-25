const ItemController = require('../../api/components/item/controller');
const UserController = require('../../api/components/user/controller');
const SkuController = require('../../api/components/sku/controller');

const Item = require('../../api/components/item/item');
const User = require('../../api/components/user/user');
const Sku = require('../../api/components/sku/sku');

const { ItemErrorFactory } = require('../../api/components/item/error');

describe("Item Controller suite", () => {

    const itemController = new ItemController();
    const userController = new UserController();
    const skuController = new SkuController();

    let testItem = Item.mockItem();
    let testSku = Sku.mockTestSku();
    let testUserSupplier = User.mockUser();
            
    beforeAll(async () => {
        await itemController.dao.deleteAllItem();
        await userController.dao.deleteAllUser();
        await skuController.dao.deleteAllSKU();
    });


    beforeAll(async () => {
        const { id : userId } = await userController.dao.createUser(testUserSupplier.email, testUserSupplier.name,
            testUserSupplier.surname, testUserSupplier.password, testUserSupplier.type)
        testUserSupplier.id = userId;
        testItem.supplierId = userId;
        const { id : skuid } = await skuController.dao.createSku(testSku.description, testSku.weight, testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
        testSku.id = skuid;
        testItem.SKUId = skuid;
        const { id: itemId } = await itemController.dao.createItem(testItem.id, testItem.description, 
            testItem.price, testItem.SKUId, testItem.supplierId);
        testItem.id = itemId;
        
    });


    describe("Get Items", () => {
       
        test("Get All Items", async () => {
            const result = await itemController.getAllItems()
            expect(result).toHaveLength(1);

            expect(result[0].description).toStrictEqual(testItem.description);
            expect(result[0].price).toStrictEqual(testItem.price);
            expect(result[0].SKUId).toStrictEqual(testItem.SKUId);
            expect(result[0].supplierId).toStrictEqual(testItem.supplierId);

        });

        test("Get Item by ID", async () => {
            const result = await itemController.getItemByID(testItem.id)
            expect(result).toBeDefined();

            expect(result.description).toStrictEqual(testItem.description);
            expect(result.price).toStrictEqual(testItem.price);
            expect(result.SKUId).toStrictEqual(testItem.SKUId);
            expect(result.supplierId).toStrictEqual(testItem.supplierId);
     });

       afterAll(async () => {
            await itemController.dao.deleteAllItem();
        });

    })

    describe("Create Item", () => {
       

        test("Create valid Item", async () => {
            try {
                await itemController.createItem(testItem.id, testItem.description, 
                    testItem.price, testItem.SKUId, testItem.supplierId);
            } catch (err) {
                let error = ItemErrorFactory.itemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        
        test("Create valid Item with invalid SKUID", async () => {
            try {
                await itemController.createItem(testItem.id, testItem.description, 
                    testItem.price, testItem.SKUId, testItem.supplierId);
            } catch (err) {
                let error = ItemErrorFactory.itemAlreadySoldBySupplier();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

         
        test("Create valid Item with invalid supplierID", async () => {
            try {
                await itemController.createItem(testItem.id+2, testItem.description, 
                    testItem.price, -1, -1);
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

        test("Modify inexistent Ite ", async () => {
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
            try{
                await itemController.deleteItem(-1)
            } catch (err) {
                let error = ItemErrorFactory.itemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Delete SKUItem", async () => {
            try{
                await itemController.deleteItem(testItem.id)
            } catch (err) {
                let error = ItemErrorFactory.itemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });
    })

    afterAll(async () => {
        await itemController.dao.deleteAllItem();
    })



})