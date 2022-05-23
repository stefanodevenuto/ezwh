const TestResultController = require('../../api/components/test_result/controller');
const TestDescriptorController = require('../../api/components/test_descriptor/controller');
const SkuItemController = require('../../api/components/skuItem/controller');
const SkuController = require('../../api/components/sku/controller');

const Sku = require('../../api/components/sku/sku');
const SkuItem = require('../../api/components/skuItem/SKUItem');
const TestDescriptor = require('../../api/components/test_descriptor/testDescriptor');
const TestResult = require('../../api/components/test_result/testResult');

const { TestResultErrorFactory } = require('../../api/components/test_result/error');

describe("Test Result Controller suite", () => {
    const skuController = new SkuController();
    const skuItemController = new SkuItemController(skuController);
    const testDescriptorController = new TestDescriptorController();
    const testResultController = new TestResultController(skuItemController);

    let testSku = Sku.mockTestSku();
    let testSkuItem = SkuItem.mockTestSkuItem();
    let testTestDescriptor = TestDescriptor.mockTestTestDescriptor();

    let testTestResult = TestResult.mockTestTestResult();
    let secondTestTestResult = TestResult.mockTestTestResult();

    beforeAll(async () => {
        await testResultController.dao.deleteAllTestResult();
    });

    describe("Get Test Result", () => {
        beforeEach(async () => {
            const { id: skuId } = await skuController.dao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
            testSkuItem.SKUId = skuId;
    
            await skuItemController.dao.createSKUItem( testSkuItem.RFID, 
                testSku.id, testSkuItem.dateOfStock)
    
            const testDescriptorId = 
                await testDescriptorController.dao.createTestDescriptor(testTestDescriptor.name, 
                    testTestDescriptor.procedureDescription, testTestDescriptor.idSKU);
            testTestDescriptor.id = testDescriptorId;

            const testResultId =
                await testResultController.dao.createTestResult(testSkuItem.RFID, testTestDescriptor.id, 
                    testTestResult.date, testTestResult.result)
            testTestResult.id = testResultId;

            const secondTestResultId =
                await testResultController.dao.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                    testTestResult.date, testTestResult.result)
            secondTestTestResult.id = secondTestResultId;
            
        });

        test("Get All Test Results", async () => {
            const result = await testResultController.getAllTestResults(testSkuItem.RFID);
            expect(result).toHaveLength(2);

            expect(result[0].idTestDescriptor).toStrictEqual(testTestDescriptor.id);
            expect(result[0].Date).toStrictEqual(testTestResult.date);
            expect(result[0].Result).toStrictEqual(testTestResult.result);

            expect(result[1].idTestDescriptor).toStrictEqual(testTestDescriptor.id);
            expect(result[1].Date).toStrictEqual(secondTestTestResult.date);
            expect(result[1].Result).toStrictEqual(secondTestTestResult.result);
        });

        test("Get Test Result by RFID and ID", async () => {
            const result = await testResultController.getTestResultByID(testTestResult.RFID, testTestResult.id)
            expect(result).toBeDefined();

            expect(result.idTestDescriptor).toStrictEqual(testTestDescriptor.id);
            expect(result.Date).toStrictEqual(testTestResult.date);
            expect(result.Result).toStrictEqual(testTestResult.result);
        });

        afterEach(async () => {
            await skuController.dao.deleteSku(testSku.id);
            await skuItemController.dao.deleteSKUItem(testSkuItem.RFID);
            await testDescriptorController.dao.deleteTestDescriptor(testTestDescriptor.id);
        });
    });

    describe("Create Test Result", () => {
        beforeAll(async () => {
            const { id: skuId } = await skuController.dao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
            testSkuItem.SKUId = skuId;
    
            await skuItemController.dao.createSKUItem( testSkuItem.RFID, 
                testSkuItem.SKUId, testSkuItem.dateOfStock)
    
            const testDescriptorId= 
                await testDescriptorController.dao.createTestDescriptor(testTestDescriptor.name, 
                    testTestDescriptor.procedureDescription, testTestDescriptor.idSKU);
            testTestDescriptor.id = testDescriptorId;
        });

        test("Create valid Test Result", async () => {
            await expect(testResultController.createTestResult(testSkuItem.RFID, 
                    testTestDescriptor.id, testTestResult.date, testTestResult.result))
                .resolves
                .not.toThrowError()
        });

        test("Create Test Result with inexistent Test Descriptor", async () => {
            try {
                await testResultController.createTestResult(testSkuItem.RFID, 
                    -1, testTestResult.date, testTestResult.result)
            } catch(err) {
                let error = TestResultErrorFactory.newTestDescriptorOrSkuItemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        afterEach(async () => {            
            await testResultController.dao.deleteTestResult(testSkuItem.RFID, testTestResult.id);
            await skuItemController.dao.deleteSKUItem(testSkuItem.RFID);
            await testDescriptorController.dao.deleteTestDescriptor(testTestDescriptor.id);
            await skuController.dao.deleteSku(testSku.id);
        });
    });

    describe("Modify Test Result", () => {
        beforeEach(async () => {
            const { id: skuId } = await skuController.dao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
            testSkuItem.SKUId = skuId;
    
            await skuItemController.dao.createSKUItem( testSkuItem.RFID, 
                testSkuItem.SKUId, testSkuItem.dateOfStock)
    
            const testDescriptorId = 
                await testDescriptorController.dao.createTestDescriptor(testTestDescriptor.name, 
                    testTestDescriptor.procedureDescription, testTestDescriptor.idSKU);
            testTestDescriptor.id = testDescriptorId;

            const testResultId =
                await testResultController.dao.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                    testTestResult.date, testTestResult.result)
            testTestResult.id = testResultId;
        });

        test("Modify inexistent Test Result", async () => {
            try {
                await testResultController.modifyTestResult(testSkuItem.RFID, -1, testTestDescriptor.id,
                    testTestResult.date, testTestResult.result)
            } catch(err) {
                let error = TestResultErrorFactory.newTestResultNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify Test Result with inexistent Sku Item", async () => {
            try {
                await testResultController.modifyTestResult("-1", testTestResult.id, testTestDescriptor.id,
                    testTestResult.date, testTestResult.result)
            } catch(err) {
                let error = TestResultErrorFactory.newTestResultNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify Test Result with inexistent Test Descriptor", async () => {
            try {
                await testResultController.modifyTestResult(testSkuItem.RFID, testTestResult.id, -1,
                    testTestResult.date, testTestResult.result)
            } catch(err) {
                let error = TestResultErrorFactory.newTestDescriptorOrSkuItemNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Modify Test Result with all valid parameters", async () => {
            await testResultController.modifyTestResult(testSkuItem.RFID, testTestResult.id, 
                testTestDescriptor.id, "2024/11/28", true)

            const result = await testResultController.getTestResultByID(testSkuItem.RFID, testTestResult.id);

            expect(result.idTestDescriptor).toStrictEqual(testTestDescriptor.id);
            expect(result.Date).toStrictEqual("2024/11/28");
            expect(result.Result).toStrictEqual(true);
        });

        afterEach(async () => {
            await skuItemController.dao.deleteSKUItem(testSkuItem.RFID);
            await testDescriptorController.dao.deleteTestDescriptor(testTestDescriptor.id);
            await skuController.dao.deleteSku(testSku.id);
        });
    });

    describe("Has failed Test Results by RFID", () => {
        beforeEach(async () => {
            const { id: skuId } = await skuController.dao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
            testSkuItem.SKUId = skuId;
    
            await skuItemController.dao.createSKUItem( testSkuItem.RFID, 
                testSkuItem.SKUId, testSkuItem.dateOfStock)
    
            const testDescriptorId = 
                await testDescriptorController.dao.createTestDescriptor(testTestDescriptor.name, 
                    testTestDescriptor.procedureDescription, testTestDescriptor.idSKU);
            testTestDescriptor.id = testDescriptorId;
        });

        test("Sku Item has some failed Test Result", async () => {
            await testResultController.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                testTestResult.date, false)
            
            await expect(testResultController.hasFailedTestResultsByRFID(testSkuItem.RFID))
                .resolves
                .toBe(true)
        })

        test("Sku Item has no failed Test Result", async () => {
            await testResultController.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                testTestResult.date, true)
            
            await expect(testResultController.hasFailedTestResultsByRFID(testSkuItem.RFID))
                .resolves
                .toBe(false)
        })

        afterEach(async () => {
            await skuItemController.dao.deleteSKUItem(testSkuItem.RFID);
            await testDescriptorController.dao.deleteTestDescriptor(testTestDescriptor.id);
            await skuController.dao.deleteSku(testSku.id);
        });
    });
});