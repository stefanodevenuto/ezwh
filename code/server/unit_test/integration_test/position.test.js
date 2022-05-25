const SkuController = require('../../api/components/sku/controller');
const PositionController = require('../../api/components/position/controller');

const Sku = require('../../api/components/sku/sku');
const Position = require('../../api/components/position/position');

const { SkuErrorFactory } = require('../../api/components/sku/error');
const { PositionErrorFactory } = require('../../api/components/position/error');

describe("Position Controller suite", () => {

    const skuController = new SkuController();
    const positionController = new PositionController();

    let testSku = Sku.mockTestSku();
    let testPosition = Position.mockTestPosition();


            
    beforeAll(async () => {
        await positionController.dao.deleteAllPosition();
    });


    beforeAll(async () => {
        await positionController.dao.createPosition(testPosition.positionID, testPosition.aisleID, testPosition.row, testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
    });


    describe("Get Positions", () => {
       
        test("Get All Position", async () => {
            const result = await positionController.getAllPositions();
            expect(result).toHaveLength(1);

            expect(result[0].positionID).toStrictEqual(testPosition.positionID);
            expect(result[0].aisleID).toStrictEqual(testPosition.aisleID);
            expect(result[0].row).toStrictEqual(testPosition.row);
            expect(result[0].col).toStrictEqual(testPosition.col);
            expect(result[0].maxWeight).toStrictEqual(testPosition.maxWeight);
            expect(result[0].maxVolume).toStrictEqual(testPosition.maxVolume);
        
        });

        test("Get Position by ID", async () => {
            const result = await positionController.getPositionByID(testPosition.positionID)
            expect(result).toBeDefined();

            expect(result.positionID).toStrictEqual(testPosition.positionID);
            expect(result.aisleID).toStrictEqual(testPosition.aisleID);
            expect(result.row).toStrictEqual(testPosition.row);
            expect(result.col).toStrictEqual(testPosition.col);
            expect(result.maxWeight).toStrictEqual(testPosition.maxWeight);
            expect(result.maxVolume).toStrictEqual(testPosition.maxVolume);
        });

        afterAll(async () => {
            await positionController.dao.deleteAllPosition();
        });

    })

    describe("Create Position", () => {
       

        test("Create valid Position", async () => {
            try{
            await positionController.createPosition(testPosition.positionID, testPosition.aisleID, testPosition.row, 
                testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
            } catch (err) {
                let error = PositionErrorFactory.newPositionIDNotUnique();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Create two time the same Position", async () => {
            try {
               await positionController.createPosition(testPosition.positionID, testPosition.aisleID, testPosition.row, 
                testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
            } catch (err) {
                let error = PositionErrorFactory.newPositionIDNotUnique();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        afterAll(async () => {
            await positionController.dao.deleteAllPosition();
        });


    });

    describe("Modify SKU", () => {


        beforeAll(async () => {
            await positionController.dao.createPosition(testPosition.positionID, testPosition.aisleID, testPosition.row, testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
        });
      

        test("Modify inexistent Position", async () => {
            try {
                await positionController.modifyPosition(555, 5, 5, 
                 5, testPosition.maxWeight, testPosition.maxVolume, testPosition.occupiedWeight, testPosition.occupiedVolume);
             } catch (err) {
                 let error = PositionErrorFactory.newPositionNotFound();
                 expect(err.customCode).toStrictEqual(error.customCode);
                 expect(err.customMessage).toMatch(error.customMessage);
             }
        });

        test("Modify valid Position", async () => {
            try {
                let newPosition = {
                    positionID : 800556451234,
                    aisleID : 8005,
                    row : 5645,
                    col : 1234,
                    maxWeight : 1500,
                    maxVolume : 1500,
                    occupiedWeight : 50,
                    occupiedVolume : 50
                }
                await positionController.modifyPosition(testPosition.positionID, newPosition.aisleID, newPosition.row, 
                 newPosition.col, testPosition.maxWeight, testPosition.maxVolume, testPosition.occupiedWeight, testPosition.occupiedVolume);
             } catch (err) {
                 let error = PositionErrorFactory.newPositionNotFound();
                 expect(err.customCode).toStrictEqual(error.customCode);
                 expect(err.customMessage).toMatch(error.customMessage);
             }
        });

        test("Modify Position ID", async () => {
            try {
                let newPosition = {
                    positionID : 800556451234,
                    aisleID : 8005,
                    row : 5645,
                    col : 1234,
                    maxWeight : 1500,
                    maxVolume : 1500,
                    occupiedWeight : 50,
                    occupiedVolume : 50
                }
                await positionController.modifyPositionID(newPosition.positionID, testPosition.positionID);
             } catch (err) {
                 let error = PositionErrorFactory.newPositionNotFound();
                 expect(err.customCode).toStrictEqual(error.customCode);
                 expect(err.customMessage).toMatch(error.customMessage);
             }
        });

    
        test("Modify invalid Position ID", async () => {
            let newPosition = {
                positionID : 800556451234,
                aisleID : 8005,
                row : 5645,
                col : 1234,
                maxWeight : 1500,
                maxVolume : 1500,
                occupiedWeight : 50,
                occupiedVolume : 50
            }
            try {
                await positionController.createPosition(testPosition.positionID, testPosition.aisleID, testPosition.row, testPosition.col, testPosition.maxWeight, testPosition.maxVolume)
                await positionController.modifyPositionID(newPosition.positionID, testPosition.positionID);
             } catch (err) {
                let error = PositionErrorFactory.newPositionNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

    
    });


    describe("Delete SKU", () => {

        test("Delete inexistent Position", async () => {
            try{
                await positionController.deletePosition(testPosition.positionID)
            } catch (err) {
                let error = PositionErrorFactory.newPositionNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Delete Position", async () => {
            try{
                await positionController.deletePosition(testPosition.positionID)
            } catch (err) {
                let error = PositionErrorFactory.newPositionNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });
    })

    afterAll(async () => {
        await positionController.deletePosition(testPosition.positionID);
    })



})