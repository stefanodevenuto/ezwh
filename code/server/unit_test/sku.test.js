const SkuDAO = require('../api/components/sku/dao');
const PositionDAO = require('../api/components/position/dao');

const Sku = require('../api/components/sku/sku');

describe("Testing SkuDAO", () => {
    const skuDao = new SkuDAO();
    const positionDao = new PositionDAO();

    let testSku = Sku.mockTestSku();

    const firstPositionId = "800234543459";
    const secondPositionId = "800234543460";
    const inexistentPositionId = "999999999999";

    test("Create Sku", async () => {
        const { id } = await skuDao.createSku(testSku.description, testSku.weight, testSku.volume,
            testSku.notes, testSku.price, testSku.availableQuantity);
        testSku.id = id;

        const result = await skuDao.getSkuByID(id);

        expect(result.description).toStrictEqual(testSku.description);
        expect(result.weight).toStrictEqual(testSku.weight);
        expect(result.volume).toStrictEqual(testSku.volume);
        expect(result.notes).toStrictEqual(testSku.notes);
        expect(result.price).toStrictEqual(testSku.price);
        expect(result.availableQuantity).toStrictEqual(testSku.availableQuantity);
    });

    beforeEach(async () => {
        await skuDao.deleteSku(testSku.id);
    })

    describe("Add or Modify Position of Sku", () => {
        beforeEach( async () => {
            const { id } = await skuDao.createSku(testSku.description, testSku.weight, testSku.volume,
                testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = id;
        });

        test("Add Position to a inexistent Sku", async () => {
            const { changes } = await skuDao.addModifySkuPosition(-1, firstPositionId);
            expect(changes).toStrictEqual(0);
        });

        test("Add inexistent Position to a Sku", async () => {
            try {
                await skuDao.addModifySkuPosition(testSku.id, inexistentPositionId);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("FOREIGN");
            }
        });

        test("Add a not occupied Position to Sku without a previous Position", async () => {
            await positionDao.createPosition(firstPositionId, "8002", "3454", "3459", 1000, 1000);
            await skuDao.addModifySkuPosition(testSku.id, firstPositionId);

            const resultSku = await skuDao.getSkuByID(testSku.id);
            const resultPosition = await positionDao.getPositionByID(firstPositionId);
    
            expect(resultSku.positionId).toStrictEqual(firstPositionId);
            expect(resultPosition.occupiedWeight).toStrictEqual(resultSku.availableQuantity * resultSku.weight);
            expect(resultPosition.occupiedVolume).toStrictEqual(resultSku.availableQuantity * resultSku.volume);
        });

        test("Add occupied Position to Sku without a previous Position", async () => {
            //expect.assertions(5);
            await positionDao.createPosition(firstPositionId, "8002", "3454", "3459", 1000, 1000);
            await skuDao.addModifySkuPosition(testSku.id, firstPositionId);

            const resultSku = await skuDao.getSkuByID(testSku.id);
            const resultPosition = await positionDao.getPositionByID(firstPositionId);
    
            expect(resultSku.positionId).toStrictEqual(firstPositionId);
            expect(resultPosition.occupiedWeight).toStrictEqual(resultSku.availableQuantity * resultSku.weight);
            expect(resultPosition.occupiedVolume).toStrictEqual(resultSku.availableQuantity * resultSku.volume);

            const { id: secondSku } = await skuDao.createSku(testSku.description, testSku.weight, testSku.volume,
                testSku.notes, testSku.price, testSku.availableQuantity);
            try {
                await skuDao.addModifySkuPosition(secondSku, firstPositionId)
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("sku.positionId");

                await skuDao.deleteSku(secondSku);
            }
        });

        test("Add Position to Sku with a previous Position", async () => {            
            await positionDao.createPosition(firstPositionId, "8002", "3454", "3459", 1000, 1000);
            await positionDao.createPosition(secondPositionId, "8002", "3454", "3460", 1000, 1000);

            await skuDao.addModifySkuPosition(testSku.id, firstPositionId);
            await skuDao.addModifySkuPosition(testSku.id, secondPositionId);
            
            const resultFirstPosition = await positionDao.getPositionByID(firstPositionId);
            const resultSecondPosition = await positionDao.getPositionByID(secondPositionId);
            const resultSku = await skuDao.getSkuByID(testSku.id);
            
            expect(resultFirstPosition.occupiedWeight).toStrictEqual(0);
            expect(resultFirstPosition.occupiedVolume).toStrictEqual(0);
            expect(resultSecondPosition.occupiedWeight).toStrictEqual(resultSku.availableQuantity * resultSku.weight);
            expect(resultSecondPosition.occupiedVolume).toStrictEqual(resultSku.availableQuantity * resultSku.volume);
        });

        test("Add a Position to a Sku with Weight exceeding", async () => {            
            await positionDao.createPosition(firstPositionId, "8002", "3454", "3459", 10, 1000);

            try {
                await skuDao.addModifySkuPosition(testSku.id, firstPositionId);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("occupiedWeight");   
            }
        });

        test("Add a Position to a Sku with Volume exceding", async () => {            
            await positionDao.createPosition(firstPositionId, "8002", "3454", "3459", 1000, 10);

            try {
                await skuDao.addModifySkuPosition(testSku.id, firstPositionId);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("occupiedVolume");   
            }
        });
        
        afterEach(async () => {
            await positionDao.deletePosition(firstPositionId);
            await positionDao.deletePosition(secondPositionId);

            await skuDao.deleteSku(testSku.id);
        })
    });

    describe("Modify Sku", () => {
        beforeEach( async () => {
            const { id } = await skuDao.createSku(testSku.description, testSku.weight, testSku.volume,
                testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = id;
        });

        test("Modify inexistent Sku", async () => {
            const { changes } = await skuDao.modifySku(-1, testSku.description, testSku.weight, testSku.volume,
                testSku.notes, testSku.price, testSku.availableQuantity, 100, 100);
            expect(changes).toStrictEqual(0);
        });

        test("Modify Sku with no related Position", async () => {
            let modifiedSku = {
                newDescription: "a new description",
                newWeight: 11,
                newVolume: 10,
                newNotes: "a new note",
                newPrice: 13.20,
                newAvailableQuantity: 10
            }

            const { changes } = await skuDao.modifySku(testSku.id, modifiedSku.newDescription, 
                modifiedSku.newWeight, modifiedSku.newVolume, modifiedSku.newNotes, modifiedSku.newPrice,
                modifiedSku.newAvailableQuantity, 110, 100);
            expect(changes).toStrictEqual(1);

            const result = await skuDao.getSkuByID(testSku.id);

            expect(result.description).toStrictEqual(modifiedSku.newDescription);
            expect(result.weight).toStrictEqual(modifiedSku.newWeight);
            expect(result.volume).toStrictEqual(modifiedSku.newVolume);
            expect(result.notes).toStrictEqual(modifiedSku.newNotes);
            expect(result.price).toStrictEqual(modifiedSku.newPrice);
            expect(result.availableQuantity).toStrictEqual(modifiedSku.newAvailableQuantity);
        });

        test("Modify Sku with a Position associated", async () => {
            await positionDao.createPosition(firstPositionId, "8002", "3454", "3459", 1000, 1000);
            await skuDao.addModifySkuPosition(testSku.id, firstPositionId);

            let modifiedSku = {
                newDescription: "a new description",
                newWeight: 11,
                newVolume: 10,
                newNotes: "a new note",
                newPrice: 13.20,
                newAvailableQuantity: 10
            }

            const { changes } = await skuDao.modifySku(testSku.id, modifiedSku.newDescription, 
                modifiedSku.newWeight, modifiedSku.newVolume, modifiedSku.newNotes, modifiedSku.newPrice,
                modifiedSku.newAvailableQuantity, modifiedSku.newWeight * modifiedSku.newAvailableQuantity,
                modifiedSku.newVolume * modifiedSku.newAvailableQuantity);
            expect(changes).toStrictEqual(2);

            const resultSku = await skuDao.getSkuByID(testSku.id);
            const resultPosition = await positionDao.getPositionByID(firstPositionId);

            expect(resultSku.description).toStrictEqual(modifiedSku.newDescription);
            expect(resultSku.weight).toStrictEqual(modifiedSku.newWeight);
            expect(resultSku.volume).toStrictEqual(modifiedSku.newVolume);
            expect(resultSku.notes).toStrictEqual(modifiedSku.newNotes);
            expect(resultSku.price).toStrictEqual(modifiedSku.newPrice);
            expect(resultSku.availableQuantity).toStrictEqual(modifiedSku.newAvailableQuantity);

            expect(resultPosition.occupiedWeight).toStrictEqual(resultSku.availableQuantity * resultSku.weight);
            expect(resultPosition.occupiedVolume).toStrictEqual(resultSku.availableQuantity * resultSku.volume);
        });

        test("Modify Sku with a Position associated exceeding Weight", async () => {
            await positionDao.createPosition(firstPositionId, "8002", "3454", "3459", 1000, 1000);
            await skuDao.addModifySkuPosition(testSku.id, firstPositionId);

            let modifiedSku = {
                newDescription: "a new description",
                newWeight: 1100,
                newVolume: 10,
                newNotes: "a new note",
                newPrice: 13.20,
                newAvailableQuantity: 10
            }

            try {
                await skuDao.modifySku(testSku.id, modifiedSku.newDescription, 
                    modifiedSku.newWeight, modifiedSku.newVolume, modifiedSku.newNotes, modifiedSku.newPrice,
                    modifiedSku.newAvailableQuantity, modifiedSku.newWeight * modifiedSku.newAvailableQuantity,
                    modifiedSku.newVolume * modifiedSku.newAvailableQuantity);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("occupiedWeight");
            }
        });

        test("Modify Sku with a Position associated exceeding Volume", async () => {
            await positionDao.createPosition(firstPositionId, "8002", "3454", "3459", 1000, 1000);
            await skuDao.addModifySkuPosition(testSku.id, firstPositionId);

            let modifiedSku = {
                newDescription: "a new description",
                newWeight: 11,
                newVolume: 1000,
                newNotes: "a new note",
                newPrice: 13.20,
                newAvailableQuantity: 10
            }

            try {
                await skuDao.modifySku(testSku.id, modifiedSku.newDescription, 
                    modifiedSku.newWeight, modifiedSku.newVolume, modifiedSku.newNotes, modifiedSku.newPrice,
                    modifiedSku.newAvailableQuantity, modifiedSku.newWeight * modifiedSku.newAvailableQuantity,
                    modifiedSku.newVolume * modifiedSku.newAvailableQuantity);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("occupiedVolume");
            }
        });

        afterEach(async () => {
            await positionDao.deletePosition(firstPositionId);

            await skuDao.deleteSku(testSku.id);
        })
    });

    describe("Delete Sku", () => {
        test("Delete inexistent Sku", async () => {
            const { changes } = await skuDao.deleteSku(-1);
            expect(changes).toStrictEqual(0);
        });

        test("Delete existent Sku", async () => {
            const { id } = await skuDao.createSku(testSku);

            const { changes } = await skuDao.deleteSku(id);
            expect(changes).toStrictEqual(1);
        });
    });
})
