const SKUItemDAO = require('../api/components/skuItem/dao');
const SkuDAO = require('../api/components/sku/dao');

const SkuItem = require('../api/components/skuItem/SKUItem');
const SKUItem = require('../api/components/skuItem/SKUItem');

describe("Testing SKUItemDAO", () => {
    const skuItemDao = new SKUItemDAO();
    const skuDao = new SkuDAO();

    let testSKUItem = SkuItem.mockTestSkuItem();

    beforeAll(async () => {
        await skuDao.deleteAllSKU();
        await skuItemDao.deleteAllSKUItem();
    });

    test("Create SKUItem after check SKUId", async () => {

        const sku = await skuDao.createSku(undefined, undefined, undefined, undefined, undefined, undefined);
        testSKUItem.SKUId = sku.id;
        await skuItemDao.createSKUItem(testSKUItem.RFID, testSKUItem.SKUId, testSKUItem.dateOfStock);    
        

        const result = await skuItemDao.getSKUItemByRFID(testSKUItem.RFID);

        expect(result.SKUId).toStrictEqual(testSKUItem.SKUId);
        expect(result.available).toStrictEqual(testSKUItem.available);
        expect(result.dateOfStock).toStrictEqual(testSKUItem.dateOfStock);

       
  
    });


   describe("Modify SKUItem", () => {

    test("Modify inexistent SKUItem", async () => {
        const { changes } = await skuItemDao.modifySKUItem(-1, testSKUItem.newRFID, testSKUItem.newAvailable, testSKUItem.newDateOfStock);
        expect(changes).toStrictEqual(0);
    });

        test("Modify SKUItem after create", async () => {

            let skuItemMod = {
                newRFID: "12345678901234567890123456780006",
                newAvailable:1,
                newDateOfStock:"2022/11/28 05:30"
            };
            
                const {changes} = await skuItemDao.modifySKUItem(testSKUItem.RFID, skuItemMod.newRFID, skuItemMod.newAvailable, skuItemMod.newDateOfStock);    
                expect(changes).toStrictEqual(1);

                testSKUItem.RFID = skuItemMod.newRFID;
                const result = await skuItemDao.getSKUItemByRFID(skuItemMod.newRFID);

                expect(result.available).toStrictEqual(skuItemMod.newAvailable);
                expect(result.dateOfStock).toStrictEqual(skuItemMod.newDateOfStock);

            
        });
      
    });

    describe("Delete SKUItem", () => {
        test("Delete inexistent SkuItem", async () => {
            const { changes } = await skuItemDao.deleteSKUItem(-1);
            expect(changes).toStrictEqual(0);
        });


        test("Delete SKUItem after create",async () => {
            const { changes } = await skuItemDao.deleteSKUItem(testSKUItem.RFID);
            expect(changes).toStrictEqual(1);
        });
        
    
    })




})