const TestResultDAO = require('../api/components/test_result/dao');
const TestDescriptorDAO = require('../api/components/test_descriptor/dao');
const SkuItemDAO = require('../api/components/skuItem/dao');
const SkuDAO = require('../api/components/sku/dao');

const TestResult = require('../api/components/test_result/testResult');
const TestDescriptor = require('../api/components/test_descriptor/testDescriptor');
const SkuItem = require('../api/components/skuItem/skuItem');
const Sku = require('../api/components/sku/sku');

describe("Unit testing for test result", () => {
    // initialization
    const testResultDAO = new TestResultDAO();
    const testDescriptorDAO = new TestDescriptorDAO();
    const skuItemDAO = new SkuItemDAO();
    const skuDAO = new SkuDAO();

    let testTestResult = TestResult.mockTestTestResult();
    let secondTestTestResult = TestResult.mockTestTestResult();
    let testTestDescriptor = TestDescriptor.mockTestTestDescriptor();
    let testSkuItem = SkuItem.mockTestSkuItem();
    let testSku = Sku.mockTestSku();

    beforeAll(async () => {
        await skuDAO.deleteAllSKU();
        await skuItemDAO.deleteAllSKUItem();
        await testDescriptorDAO.deleteAllTestDescriptor();
        await testResultDAO.deleteAllTestResult();
    });

    beforeEach(async () => {
        const { id: skuId } = await skuDAO.createSku(testSku.description, testSku.weight,
            testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
        testSku.id = skuId;
        testSkuItem.SKUId = skuId;

        await skuItemDAO.createSKUItem(testSkuItem.RFID,
            testSku.id, testSkuItem.dateOfStock)

        const testDescriptorId =
            await testDescriptorDAO.createTestDescriptor(testTestDescriptor.name,
                testTestDescriptor.procedureDescription, testTestDescriptor.idSKU);
        testTestDescriptor.id = testDescriptorId;
    });

    describe("Get Test Results", () => {
        beforeEach(async () => {
            const testResultId =
                await testResultDAO.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                    testTestResult.date, testTestResult.result)
            testTestResult.id = testResultId;

            const secondTestResultId =
                await testResultDAO.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                    secondTestTestResult.date, secondTestTestResult.result)
            secondTestTestResult.id = secondTestResultId;
        })

        test("Get All Test Results", async () => {
            const result = await testResultDAO.getAllTestResults(testSkuItem.RFID);
            expect(result).toHaveLength(2);

            expect(result[0].id).toStrictEqual(testTestResult.id);
            expect(result[0].testDescriptorId).toStrictEqual(testTestDescriptor.id);
            expect(result[0].date).toStrictEqual(testTestResult.date);
            expect(result[0].result).toStrictEqual(+testTestResult.result);
            expect(result[0].RFID).toStrictEqual(testTestResult.RFID);

            expect(result[1].id).toStrictEqual(secondTestTestResult.id);
            expect(result[1].testDescriptorId).toStrictEqual(testTestDescriptor.id);
            expect(result[1].date).toStrictEqual(secondTestTestResult.date);
            expect(result[1].result).toStrictEqual(+secondTestTestResult.result);
            expect(result[1].RFID).toStrictEqual(secondTestTestResult.RFID);
        });

        test("Get Test Result", async () => {
            const result = await testResultDAO.getTestResultByID(testSkuItem.RFID, testTestResult.id);

            expect(result.id).toStrictEqual(testTestResult.id);
            expect(result.testDescriptorId).toStrictEqual(testTestDescriptor.id);
            expect(result.date).toStrictEqual(testTestResult.date);
            expect(result.result).toStrictEqual(+testTestResult.result);
            expect(result.RFID).toStrictEqual(testTestResult.RFID);
        });

        test("Get inexistent Test Result", async () => {
            const result = await testResultDAO.getTestResultByID(testSkuItem.RFID, -1);
            expect(result).toBeUndefined()
        });

        afterEach(async () => {
            await testResultDAO.deleteAllTestResult();
        })
    });

    describe("Create test result", () => {
        test("Create Test Result with inexistent Test Descriptor", async () => {
            try {
                await testResultDAO.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                    testTestResult.date, testTestResult.result)
            } catch (err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("FOREIGN");
            }
        });

        test("Creating test result", async () => {
            const testResultId =
                await testResultDAO.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                    testTestResult.date, testTestResult.result)
            testTestResult.id = testResultId;
            testTestResult.testDescriptorId = testTestDescriptor.id;

            const result = await testResultDAO.getTestResultByID(testTestResult.RFID, testTestResult.id);

            expect(result.id).toStrictEqual(testTestResult.id);
            expect(result.testDescriptorId).toStrictEqual(testTestDescriptor.id);
            expect(result.date).toStrictEqual(testTestResult.date);
            expect(result.result).toStrictEqual(+testTestResult.result);
            expect(result.RFID).toStrictEqual(testTestResult.RFID);
        });
    });

    describe("Modify test result", () => {
        beforeEach(async () => {
            const testResultId =
                await testResultDAO.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                    testTestResult.date, testTestResult.result)
            testTestResult.id = testResultId;
            testTestResult.testDescriptorId = testTestDescriptor.id;
        });

        test("Modifying existing test result", async () => {
            await testResultDAO.modifyTestResult(testTestResult.id, testTestResult.RFID,
                testTestResult.testDescriptorId, "2022-02-02", false);

            const result = await testResultDAO.getTestResultByID(testTestResult.RFID, testTestResult.id);

            expect(result.id).toStrictEqual(testTestResult.id);
            expect(result.testDescriptorId).toStrictEqual(testTestDescriptor.id);
            expect(result.date).toStrictEqual("2022-02-02");
            expect(result.result).toStrictEqual(+false);
            expect(result.RFID).toStrictEqual(testTestResult.RFID);
        });

        test("Modifying Test Result with not existing Test Descriptor", async () => {
            try {
                await testResultDAO.modifyTestResult(testTestResult.id, testTestResult.RFID, 
                    -1, "2022-02-02", false);
            } catch (err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("FOREIGN");
            }
        });

        test("Modifying not existing Test Result", async () => {
            const { changes } = await testResultDAO.modifyTestResult(-1, testTestResult.RFID, 
                testTestResult.testDescriptorId, "2022-02-02", false);
            expect(changes).toStrictEqual(0);
        });

        afterEach(async () => {
            testResultDAO.deleteAllTestResult();
        });
    });

    describe("Delete test result", () => {
        beforeEach(async () => {
            const testResultId =
                await testResultDAO.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                    testTestResult.date, testTestResult.result)
            testTestResult.id = testResultId;
            testTestResult.testDescriptorId = testTestDescriptor.id;
        });

        test("Delete existing test result", async () => {
            const { changes } = await testResultDAO.deleteTestResult(testTestResult.RFID, testTestResult.id);
            expect(changes).toStrictEqual(1);
        });

        test("Delete not existing test result", async () => {
            const { changes } = await testResultDAO.deleteTestResult(testTestResult.RFID, -1);
            expect(changes).toStrictEqual(0);
        });

        afterEach(async () => {
            await testResultDAO.deleteAllTestResult();
        })
    });

    afterEach(async () => {
        await testResultDAO.deleteAllTestResult();
        await skuItemDAO.deleteAllSKUItem();
        await testDescriptorDAO.deleteAllTestDescriptor();
        await skuDAO.deleteAllSKU();
    });

});