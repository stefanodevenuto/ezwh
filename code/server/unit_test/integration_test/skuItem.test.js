const SkuItemController = require('../../api/components/skuItem/controller');
const SkuController = require('../../api/components/sku/controller');

const SkuItem = require('../../api/components/skuItem/SKUItem');
const Sku = require('../../api/components/sku/sku');

const { SKUItemErrorFactory } = require('../../api/components/skuItem/error');

describe("SKU Controller suite", () => {

    const skuController = new SkuController();
    const skuItemController = new SkuItemController(skuController);

    let testSkuItem = SkuItem.mockTestSkuItem();
    let secondTestSkuItem = SkuItem.mockTestSkuItem();
    secondTestSkuItem.RFID = testSkuItem.RFID.replace(/.$/,"2")
    const newValidRFID = testSkuItem.RFID.replace(/.$/,"3");

    let testSku = Sku.mockTestSku();
            
    beforeAll(async () => {
        await skuItemController.dao.deleteAllSKUItem();
    });


    beforeAll(async () => {
        const { id : skuId } = await skuController.dao.createSku(
                                        testSku.description, 
                                        testSku.weight, 
                                        testSku.volume, 
                                        testSku.notes, 
                                        testSku.availableQuantity, 
                                        testSku.price);

        testSkuItem.SKUId = skuId;

        await skuItemController.dao.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock);
    });

    describe("Get SKUItems", () => {
       
        test("Get All SKUItems", async () => {
            const result = await skuItemController.getAllSKUItems();
            expect(result).toHaveLength(1);


            expect(result[0].RFID).toStrictEqual(testSkuItem.RFID);
            expect(result[0].SKUId).toStrictEqual(testSkuItem.SKUId);
            expect(result[0].Available).toStrictEqual(testSkuItem.available);
            expect(result[0].DateOfStock).toStrictEqual(testSkuItem.dateOfStock); 
        });

        test("Get SKUItems by ID", async () => {
            const result = await skuItemController.getSKUItemByRFID(testSkuItem.RFID)
            expect(result).toBeDefined();

            expect(result.RFID).toStrictEqual(testSkuItem.RFID);
            expect(result.SKUId).toStrictEqual(testSkuItem.SKUId);
            expect(result.Available).toStrictEqual(testSkuItem.available);
            expect(result.DateOfStock).toStrictEqual(testSkuItem.dateOfStock);
        });

        afterAll(async () => {
            await skuItemController.dao.deleteAllSKUItem();
        });

    })

    describe("Create SKUItem", () => {
       

        test("Create invalid SKUItem", async () => {
            try {
                await skuItemController.createSKUItem("null", testSkuItem.SKUId, testSkuItem.dateOfStock)
            } catch (err) {
                let error = SKUItemErrorFactory.newSKUItemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
                
        });

        test("Create valid SKUItem", async () => {
            await expect(skuItemController.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock))
                .resolves
                .not.toThrowError();     
        });

        test("Create double SKUItem", async () => {
            try {
                await skuItemController.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock)
            } catch (err) {
                let error = SKUItemErrorFactory.newSKUItemRFIDNotUnique();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
                
        });

        afterAll(async () => {
            await skuItemController.dao.deleteAllSKUItem();
        });


    });

    describe("Modify SKUItem", () => {


        beforeAll(async () => {
            const { id : skuId } = await skuController.dao.createSku(
                testSku.description, 
                testSku.weight, 
                testSku.volume, 
                testSku.notes, 
                testSku.availableQuantity, 
                testSku.price);

            testSkuItem.SKUId = skuId;
            secondTestSkuItem.SKUId = skuId;                
            
            await skuItemController.dao.createSKUItem(testSkuItem.RFID, 
                testSkuItem.SKUId, testSkuItem.dateOfStock);
            await skuItemController.dao.createSKUItem(secondTestSkuItem.RFID, 
                secondTestSkuItem.SKUId, secondTestSkuItem.dateOfStock);            
        });

        test("Modify inexistent SKUItem", async () => {
            expect.assertions(2);
            try{
                await skuItemController.modifySKUItem(undefined, testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock)
            } catch (err) {
                let error = SKUItemErrorFactory.newSKUItemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }

        });

       
        test("Modify valid SKUItem", async () => {
            let newSkuitem = {
                newRFID : newValidRFID,
                newAvailable : 1,
                newDataOfStock : "2022/05/02 08:30"
            }
            await expect(skuItemController.modifySKUItem(testSkuItem.RFID, 
                newSkuitem.newRFID, newSkuitem.newAvailable, newSkuitem.newDataOfStock))
                    .resolves
                    .not.toThrowError();

            testSkuItem.RFID = newSkuitem.newRFID;

        });

        test("Modify SKUItem with a RFID that already exist", async () => {
            expect.assertions(2);
            try{
                let newSkuitem = {
                    newRFID : secondTestSkuItem.RFID,
                    newAvailable : 1,
                    newDataOfStock : "2022/05/02 08:30"
                }
            
                await skuItemController.modifySKUItem(testSkuItem.RFID, newSkuitem.newRFID, 
                    newSkuitem.newAvailable, newSkuitem.newDataOfStock)
            } catch (err) {
                let error = SKUItemErrorFactory.newSKUItemRFIDNotUnique();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }

        });

        afterAll(async () => {
            await skuItemController.dao.deleteAllSKUItem();
        });
    });

    describe("Delete SKU", () => {

        test("Delete inexistent SKUitem", async () => {
            await expect(skuItemController.deleteSKUItem(-1))
                .resolves
                .not.toThrowError();
        });

        test("Delete SKUItem", async () => {
            await expect(skuItemController.deleteSKUItem(testSkuItem.RFID))
                .resolves
                .not.toThrowError();
        });
    })

    afterAll(async () => {
        await skuController.dao.deleteAllSKU();
    })



})