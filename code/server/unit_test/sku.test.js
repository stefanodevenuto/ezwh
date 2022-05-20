const SkuDAO = require('../api/components/sku/dao');
const PositionDAO = require('../api/components/position/dao');

describe("SkuDAO functions", () => {
    const skuDao = new SkuDAO();
    const positionDao = new PositionDAO();
    const firstPositionId = "800234543459";
    const secondPositionId = "800234543460";
    const inexistentPositionId = "999999999999";

    let sku = {
        description: "a new Sku",
        weight: 20,
        volume: 20,
        notes: "a note",
        price: 10.99,
        availableQuantity: 30
    };

    test("Create Sku", async () => {
        const { id } = await skuDao.createSku(sku);
        const result = await skuDao.getSkuByID(id);

        expect(result.description).toStrictEqual(sku.description);
        expect(result.weight).toStrictEqual(sku.weight);
        expect(result.volume).toStrictEqual(sku.volume);
        expect(result.notes).toStrictEqual(sku.notes);
        expect(result.price).toStrictEqual(sku.price);
        expect(result.availableQuantity).toStrictEqual(sku.availableQuantity);
    });

    describe("Add or Modify Position of Sku", () => {
        test("Add Position to a inexistent Sku", async () => {
            let position = {
                positionID: firstPositionId,
                aisleID: "8002",
                row: "3454",
                col: "3459",
                maxWeight: 1000,
                maxVolume: 1000
            };

            const { changes } = await skuDao.addModifySkuPosition(-1, position.positionID);
            expect(changes).toStrictEqual(0);
        });

        test("Add inexistent Position to a Sku", async () => {
            const { id } = await skuDao.createSku(sku);

            let position = {
                positionID: inexistentPositionId,
                aisleID: "9999",
                row: "9999",
                col: "9999",
                maxWeight: 1000,
                maxVolume: 1000
            };

            try {
                await skuDao.addModifySkuPosition(id, position.positionID);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("FOREIGN");
            }
        });

        test("Add a not occupied Position to Sku without a previous Position", async () => {
            const { id } = await skuDao.createSku(sku);
            
            let position = {
                positionID: firstPositionId,
                aisleID: "8002",
                row: "3454",
                col: "3459",
                maxWeight: 1000,
                maxVolume: 1000
            };
            
            await positionDao.createPosition(position);
            await skuDao.addModifySkuPosition(id, position.positionID);

            const resultSku = await skuDao.getSkuByID(id);
            const resultPosition = await positionDao.getPositionByID(position.positionID);
    
            expect(resultSku.positionId).toStrictEqual(position.positionID);
            expect(resultPosition.occupiedWeight).toStrictEqual(resultSku.availableQuantity * resultSku.weight);
            expect(resultPosition.occupiedVolume).toStrictEqual(resultSku.availableQuantity * resultSku.volume);
        });

        test("Add occupied Position to Sku without a previous Position", async () => {
            expect.assertions(5);

            const { id: firstSku } = await skuDao.createSku(sku);
            
            let position = {
                positionID: firstPositionId,
                aisleID: "8002",
                row: "3454",
                col: "3459",
                maxWeight: 1000,
                maxVolume: 1000
            };
            
            await positionDao.createPosition(position);
            await skuDao.addModifySkuPosition(firstSku, position.positionID);

            const resultSku = await skuDao.getSkuByID(firstSku);
            const resultPosition = await positionDao.getPositionByID(position.positionID);
    
            expect(resultSku.positionId).toStrictEqual(position.positionID);
            expect(resultPosition.occupiedWeight).toStrictEqual(resultSku.availableQuantity * resultSku.weight);
            expect(resultPosition.occupiedVolume).toStrictEqual(resultSku.availableQuantity * resultSku.volume);

            const { id: secondSku } = await skuDao.createSku(sku);
            try {
                await skuDao.addModifySkuPosition(secondSku, position.positionID)
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("sku.positionId");
            }
        });

        test("Add Position to Sku with a previous Position", async () => {
            const { id } = await skuDao.createSku(sku);
            
            let firstPosition = {
                positionID: firstPositionId,
                aisleID: "8002",
                row: "3454",
                col: "3459",
                maxWeight: 1000,
                maxVolume: 1000
            };

            let secondPosition = {
                positionID: secondPositionId,
                aisleID: "8002",
                row: "3454",
                col: "3459",
                maxWeight: 1000,
                maxVolume: 1000
            };
            
            await positionDao.createPosition(firstPosition);
            await positionDao.createPosition(secondPosition);

            await skuDao.addModifySkuPosition(id, firstPosition.positionID);
            await skuDao.addModifySkuPosition(id, secondPosition.positionID);
            
            const resultFirstPosition = await positionDao.getPositionByID(firstPosition.positionID);
            const resultSecondPosition = await positionDao.getPositionByID(secondPosition.positionID);
            const resultSku = await skuDao.getSkuByID(id);
            
            expect(resultFirstPosition.occupiedWeight).toStrictEqual(0);
            expect(resultFirstPosition.occupiedVolume).toStrictEqual(0);
            expect(resultSecondPosition.occupiedWeight).toStrictEqual(resultSku.availableQuantity * resultSku.weight);
            expect(resultSecondPosition.occupiedVolume).toStrictEqual(resultSku.availableQuantity * resultSku.volume);
        });

        test("Add a Position to a Sku with Weight exceding", async () => {
            const { id } = await skuDao.createSku(sku);
            
            let position = {
                positionID: firstPositionId,
                aisleID: "8002",
                row: "3454",
                col: "3459",
                maxWeight: 10,
                maxVolume: 1000
            };

            await positionDao.createPosition(position);

            try {
                await skuDao.addModifySkuPosition(id, position.positionID);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("occupiedWeight");   
            }
        });

        test("Add a Position to a Sku with Volume exceding", async () => {
            const { id } = await skuDao.createSku(sku);
            
            let position = {
                positionID: firstPositionId,
                aisleID: "8002",
                row: "3454",
                col: "3459",
                maxWeight: 1000,
                maxVolume: 10
            };

            await positionDao.createPosition(position);

            try {
                await skuDao.addModifySkuPosition(id, position.positionID);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("occupiedVolume");   
            }
        });
        
        afterEach(async () => {
            await positionDao.deletePosition(firstPositionId);
            await positionDao.deletePosition(secondPositionId);
        })
    });

    describe("Modify Sku", () => {
        test("Modify inexistent Sku", async () => {
            const { changes } = await skuDao.modifySku(-1, sku, 100, 100);
            expect(changes).toStrictEqual(0);
        });

        test("Modify Sku with no related Position", async () => {
            const { id } = await skuDao.createSku(sku);

            let modifiedSku = {
                newDescription: "a new description",
                newWeight: 11,
                newVolume: 10,
                newNotes: "a new note",
                newPrice: 13.20,
                newAvailableQuantity: 10
            }

            const { changes } = await skuDao.modifySku(id, modifiedSku, 100, 100);
            expect(changes).toStrictEqual(1);

            const result = await skuDao.getSkuByID(id);

            expect(result.description).toStrictEqual(modifiedSku.newDescription);
            expect(result.weight).toStrictEqual(modifiedSku.newWeight);
            expect(result.volume).toStrictEqual(modifiedSku.newVolume);
            expect(result.notes).toStrictEqual(modifiedSku.newNotes);
            expect(result.price).toStrictEqual(modifiedSku.newPrice);
            expect(result.availableQuantity).toStrictEqual(modifiedSku.newAvailableQuantity);
        });

        test("Modify Sku with a Position associated", async () => {
            const { id } = await skuDao.createSku(sku);

            let position = {
                positionID: firstPositionId,
                aisleID: "8002",
                row: "3454",
                col: "3459",
                maxWeight: 1000,
                maxVolume: 1000
            };

            await positionDao.createPosition(position);
            await skuDao.addModifySkuPosition(id, position.positionID);

            let modifiedSku = {
                newDescription: "a new description",
                newWeight: 11,
                newVolume: 10,
                newNotes: "a new note",
                newPrice: 13.20,
                newAvailableQuantity: 10
            }

            const { changes } = await skuDao.modifySku(id, modifiedSku, 
                modifiedSku.newWeight * modifiedSku.newAvailableQuantity,
                modifiedSku.newVolume * modifiedSku.newAvailableQuantity);
            expect(changes).toStrictEqual(2);

            const resultSku = await skuDao.getSkuByID(id);
            const resultPosition = await positionDao.getPositionByID(position.positionID);

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
            const { id } = await skuDao.createSku(sku);

            let position = {
                positionID: firstPositionId,
                aisleID: "8002",
                row: "3454",
                col: "3459",
                maxWeight: 1000,
                maxVolume: 1000
            };

            await positionDao.createPosition(position);
            await skuDao.addModifySkuPosition(id, position.positionID);

            let modifiedSku = {
                newDescription: "a new description",
                newWeight: 1100,
                newVolume: 10,
                newNotes: "a new note",
                newPrice: 13.20,
                newAvailableQuantity: 10
            }

            try {
                await skuDao.modifySku(id, modifiedSku, 
                    modifiedSku.newWeight * modifiedSku.newAvailableQuantity,
                    modifiedSku.newVolume * modifiedSku.newAvailableQuantity);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("occupiedWeight");
            }
        });

        test("Modify Sku with a Position associated exceeding Volume", async () => {
            const { id } = await skuDao.createSku(sku);

            let position = {
                positionID: firstPositionId,
                aisleID: "8002",
                row: "3454",
                col: "3459",
                maxWeight: 1000,
                maxVolume: 1000
            };

            await positionDao.createPosition(position);
            await skuDao.addModifySkuPosition(id, position.positionID);

            let modifiedSku = {
                newDescription: "a new description",
                newWeight: 11,
                newVolume: 1000,
                newNotes: "a new note",
                newPrice: 13.20,
                newAvailableQuantity: 10
            }

            try {
                await skuDao.modifySku(id, modifiedSku, 
                    modifiedSku.newWeight * modifiedSku.newAvailableQuantity,
                    modifiedSku.newVolume * modifiedSku.newAvailableQuantity);
            } catch(err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("occupiedVolume");
            }
        });

        afterEach(async () => {
            await positionDao.deletePosition(firstPositionId);
        })
    });

    describe("Delete Sku", () => {
        test("Delete inexistent Sku", async () => {
            const { changes } = await skuDao.deleteSku(-1);
            expect(changes).toStrictEqual(0);
        });

        test("Delete existent Sku", async () => {
            const { id } = await skuDao.createSku(sku);

            const { changes } = await skuDao.deleteSku(id);
            expect(changes).toStrictEqual(1);
        });
    });
})
