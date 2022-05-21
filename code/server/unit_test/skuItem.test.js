const SKUItemDAO = require('../api/components/skuItem/dao');
const SkuDAO = require('../api/components/sku/dao');

const SkuItem = require('../api/components/skuItem/SKUItem');
const { hasUncaughtExceptionCaptureCallback } = require('process');

describe("Testing SKUItemDAO", () => {
    const skuItemDao = new SKUItemDAO();
    const skuDao = new SkuDAO();

    let testSKUItem = SkuItem.mockTestSkuItem();

    test("Create SKUItem", async () => {

        await skuItemDao.createSKUItem(testSKUItem);    
        
        const result = await skuItemDao.getSKUItemByRFID(testSKUItem.RFID);


        expect(result.SKUId).toStrictEqual(testSKUItem.SKUId);
        expect(result.available).toStrictEqual(testSKUItem.available);
        expect(result.dateOfStock).toStrictEqual(testSKUItem.dateOfStock);
    });

    beforeEach(async () => {
        await skuItemDao.deleteSKUItem(testSKUItem.RFID);
    })





})