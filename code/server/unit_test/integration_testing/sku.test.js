const SkuController = require('../../api/components/sku/controller');
const PositionController = require('../../api/components/position/controller');

const Sku = require('../../api/components/sku/sku');
const Position = require('../../api/components/position/position');


describe("SKU Controller suite", () => {

    const skuController = new SkuController();
    const position = new PositionController();

    let testSku = Sku.mockTestSku();
    let testPosition = Position.mockTestPosition();

    /*beforeAll(async () => {
        await skuController.dao.deleteAllSKU();
    });*/


    describe("Get SKUs", () => {
        beforeEach(async () => {
            const positionID = 
            await position.dao.createPosition(testPosition.positionID, testPosition.aisleID, testPosition.row, testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
            
            const { id: skuId } = await skuController.dao.createSku(testSku);
                testSku.id = skuId;

            console.log(testSku);
            
        });

        test("Get All SKUs", async () => {
            const result = await skuController.dao.getAllSkus();
            expect(result).toHaveLength(38);
            console.log(result[37]);

            expect(result[37].description).toStrictEqual(testSku.description);
            expect(result[37].weight).toStrictEqual(testSku.weight);
            expect(result[37].volume).toStrictEqual(testSku.volume);
            expect(result[37].notes).toStrictEqual(testSku.notes);
            expect(result[37].price).toStrictEqual(testSku.price);
            expect(result[37].availableQuantity).toStrictEqual(testSku.availableQuantity);


        
        });



    })

})