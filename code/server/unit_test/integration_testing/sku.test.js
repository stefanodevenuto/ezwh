const SkuController = require('../../api/components/sku/controller');
const PositionController = require('../../api/components/position/controller');

const Sku = require('../../api/components/sku/sku');
const Position = require('../../api/components/position/position');

const { SkuErrorFactory } = require('../../api/components/sku/error');


describe("SKU Controller suite", () => {

    const skuController = new SkuController();
    const positionController = new PositionController();

    let testSku = Sku.mockTestSku();
    let testPosition = Position.mockTestPosition();


            
    beforeAll(async () => {
        await skuController.dao.deleteAllSKU();
    });


    describe("Get SKUs", () => {
        beforeAll(async () => {
            
            const { id: skuId } = await skuController.dao.createSku(testSku.description, testSku.weight, testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
                testSku.id = skuId;
        });

        test("Get All SKUs", async () => {
            const result = await skuController.dao.getAllSkus();
            expect(result).toHaveLength(2);
            console.log(result[1]);

            expect(result[1].description).toStrictEqual(testSku.description);
            expect(result[1].weight).toStrictEqual(testSku.weight);
            expect(result[1].volume).toStrictEqual(testSku.volume);
            expect(result[1].notes).toStrictEqual(testSku.notes);
            expect(result[1].price).toStrictEqual(testSku.price);
            expect(result[1].availableQuantity).toStrictEqual(testSku.availableQuantity);
        
        });

        test("Get SKUs by ID", async () => {
            const result = await skuController.getSkuByID(testSku.id)
            expect(result).toBeDefined();

            expect(result.description).toStrictEqual(testSku.description);
            expect(result.weight).toStrictEqual(testSku.weight);
            expect(result.volume).toStrictEqual(testSku.volume);
            expect(result.notes).toStrictEqual(testSku.notes);
            expect(result.price).toStrictEqual(testSku.price);
            expect(result.availableQuantity).toStrictEqual(testSku.availableQuantity);
        });

        afterAll(async () => {
            await skuController.deleteSku(testSku.id);
        });

    })

    describe("Create SKU", () => {
       

        test("Create valid SKU", async () => {
            await expect(skuController.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity))
                .resolves
                .not.toThrowError()
        });

        afterAll(async () => {
            await skuController.deleteSku(testSku.id);
        });


    });

    describe("Modify SKU", () => {

        beforeEach(async () => {
            await skuController.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity)
        })

      
        test("Modify inexistent SKU", async () => {
            await expect(skuController.modifySku(-1, testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity))
                .rejects
                .toThrow(SkuErrorFactory.newSkuNotFound())
        });

        test("Add or modify position of a SKU", async () => {
            await expect(skuController.addModifySkuPosition(testSku.id, testPosition.positionID))
                .resolves
                
                
        });

        test("Add or modify position that does not exist of a SKU", async () => {
            await expect(skuController.addModifySkuPosition(testSku.id, "13451248512"))
                .rejects
                .toThrow(SkuErrorFactory.newPositionAlreadyOccupied())
        });
        afterAll(async () => {
            await skuController.deleteSku(testSku.id);
        });

    });

    describe("Delete SKU", () => {

        

        test("Delete inexistent SKU", async () => {
            await expect(skuController.deleteSku(-1))
                .rejects
                .toThrow(SkuErrorFactory.newSkuNotFound())
        });

        test("Delete SKU t", async () => {
            await expect(skuController.deleteSku(testSku.id))
                .resolves
                
        });
    })



})