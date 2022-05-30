const SkuController = require('../../api/components/sku/controller');
const PositionController = require('../../api/components/position/controller');

const Sku = require('../../api/components/sku/sku');
const Position = require('../../api/components/position/position');

const { SkuErrorFactory } = require('../../api/components/sku/error');
const { PositionErrorFactory } = require('../../api/components/position/error');

describe("SKU Controller suite", () => {

    const skuController = new SkuController();
    const positionController = new PositionController();

    let testSku = Sku.mockTestSku();
    let testPosition = Position.mockTestPosition();

    beforeAll(async () => {
        await skuController.dao.deleteAllSKU();
        await positionController.dao.deleteAllPosition();
    });

    describe("Get SKUs", () => {
        beforeEach(async () => {
            const { id: skuId } = await skuController.dao.createSku(testSku.description, testSku.weight, testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
        });

        test("Get All SKUs", async () => {
            const result = await skuController.dao.getAllSkus();
            expect(result).toHaveLength(1);

            expect(result[0].description).toStrictEqual(testSku.description);
            expect(result[0].weight).toStrictEqual(testSku.weight);
            expect(result[0].volume).toStrictEqual(testSku.volume);
            expect(result[0].notes).toStrictEqual(testSku.notes);
            expect(result[0].price).toStrictEqual(testSku.price);
            expect(result[0].availableQuantity).toStrictEqual(testSku.availableQuantity);

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

        afterEach(async () => {
            await skuController.dao.deleteAllSKU();
        });

    })

    describe("Create SKU", () => {
        test("Create valid SKU", async () => {
            await expect(skuController.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity))
                .resolves
                .not.toThrowError()
        });

        afterEach(async () => {
            await skuController.dao.deleteAllSKU();
        });
    });

    describe("Modify SKU", () => {
        beforeEach(async () => {
            const { id: skuId } = await skuController.dao.createSku(testSku.description, 
                testSku.weight, testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;

            await positionController.dao.createPosition(testPosition.positionID, testPosition.aisleID,
                testPosition.row, testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
        });

        test("Modify inexistent SKU", async () => {
            try {
                await skuController.modifySku(-1, testSku.description, testSku.weight,
                    testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity)
            } catch (err) {
                let error = SkuErrorFactory.newSkuNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Add or modify position that does not exist of a SKU", async () => {
            try {
                await skuController.addModifySkuPosition(testSku.id, "432143214321")
            } catch (err) {
                let error = PositionErrorFactory.newPositionNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Add or modify position of a SKU that does not exist", async () => {
            try {
                await skuController.addModifySkuPosition(-1, testPosition.positionID)
            } catch (err) {
                let error = SkuErrorFactory.newSkuNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Add or modify position of a SKU", async () => {
            await expect(skuController.addModifySkuPosition(testSku.id, testPosition.positionID))
                .resolves
        });

        afterEach(async () => {
            await skuController.dao.deleteAllSKU();
            await positionController.dao.deleteAllPosition();
        });

    });

    describe("Delete SKU", () => {
        beforeEach(async () => {
            const { id: skuId } = await skuController.dao.createSku(testSku.description, testSku.weight, testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
        });

        test("Delete inexistent SKU", async () => {
            await expect(skuController.deleteSku(-1))
                .resolves
                .not.toThrowError()
        });

        test("Delete valid SKU", async () => {
            await expect(skuController.deleteSku(testSku.id))
                .resolves
                .not.toThrowError()
        });

        afterEach(async () => {
            await skuController.dao.deleteAllSKU();
            await positionController.dao.deleteAllPosition();
        });
    })

    afterEach(async () => {
        await positionController.dao.deleteAllPosition();
        await skuController.dao.deleteAllSKU();
    })



})