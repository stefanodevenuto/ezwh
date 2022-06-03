const SkuItemController = require('../../api/components/skuItem/controller');
const SkuController = require('../../api/components/sku/controller');
const PositionController = require('../../api/components/position/controller');

const SkuItem = require('../../api/components/skuItem/SKUItem');
const Sku = require('../../api/components/sku/sku');
const Position = require('../../api/components/position/position');

const { SKUItemErrorFactory } = require('../../api/components/skuItem/error');

describe("SKU Controller suite", () => {

    const skuItemController = new SkuItemController();
    const skuController = new SkuController();
    const positionController = new PositionController();

    let testSkuItem = SkuItem.mockTestSkuItem();
    let testSku = Sku.mockTestSku();
    let testPosition = Position.mockTestPosition();

            
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
                console.log(err);
                let error = SKUItemErrorFactory.newSKUItemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
                
        });

        test("Create valid SKUItem", async () => {
            try {
                await skuItemController.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock)
            } catch (err) {
                let error = SKUItemErrorFactory.newSKUItemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
                
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

            await skuItemController.dao.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock);
            
        });

        test("Modify inexistent SKUItem", async () => {
            try{
                await skuItemController.modifySKUItem(undefined, testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock)
            } catch (err) {
                let error = SKUItemErrorFactory.newSKUItemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }

        });

       
        test("Modify valid SKUItem", async () => {
            try{
                let newSkuitem = {
                    newRFID : "12312312312312312312312312312312",
                    newAvailable : 1,
                    newDataOfStock : "2022/05/02 08:30"
                }
                await skuItemController.modifySKUItem(testSkuItem.RFID, newSkuitem.newRFID, newSkuitem.newAvailable, newSkuitem.newDataOfStock)

                testSkuItem.RFID = newSkuitem.newRFID;
                
            } catch (err) {
                let error = SKUItemErrorFactory.newSKUItemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }

        });

        test("Modify SKUItem with a RFID that already exist", async () => {
            try{
                let newSkuitem = {
                    newRFID : "12312312312312312312312312312312",
                    newAvailable : 1,
                    newDataOfStock : "2022/05/02 08:30"
                }
            
                await skuItemController.modifySKUItem(testSkuItem.RFID, newSkuitem.newRFID, newSkuitem.newAvailable, newSkuitem.newDataOfStock)
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
            try{
                await skuItemController.deleteSKUItem(-1)
            } catch (err) {
                let error = SKUItemErrorFactory.newSKUItemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Delete SKUItem", async () => {
            try{
                await skuItemController.deleteSKUItem(testSkuItem.RFID)
            } catch (err) {
                let error = SKUItemErrorFactory.newSKUItemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });
    })

    afterAll(async () => {
        await positionController.deletePosition(testPosition.positionID);
    })



})