const TestDescriptorDAO = require('../api/components/test_descriptor/dao');
const SkuDAO = require('../api/components/sku/dao');

const TestDescriptor = require('../api/components/test_descriptor/testDescriptor');
const Sku = require('../api/components/sku/sku');

describe("Testing testDescriptorDAO", () => {
    const testDescriptorDAO = new TestDescriptorDAO();
    const skuDAO = new SkuDAO();

    let testTestDescriptor = TestDescriptor.mockTestTestDescriptor();
    let secondTestTestDescriptor = TestDescriptor.mockTestTestDescriptor();
    let testSku = Sku.mockTestSku();
    let secondTestSku = Sku.mockTestSku();

    beforeAll(async () => {
        await testDescriptorDAO.deleteAllTestDescriptor();
    });

    describe("Get Test Descriptors", () => {
        beforeEach(async () => {
            const { id } = await skuDAO.createSku(testSku.description, testSku.weight, testSku.volume,
                testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = id;

            const testDescriptorId =
                await testDescriptorDAO.createTestDescriptor(testTestDescriptor.name,
                    testTestDescriptor.procedureDescription, testSku.id);
            testTestDescriptor.id = testDescriptorId;
            testTestDescriptor.idSKU = testSku.id;
        });

        test("Get All Test Descriptors", async () => {
            const [result] = await testDescriptorDAO.getAllTestDescriptors();

            expect(result.id).toStrictEqual(testTestDescriptor.id);
            expect(result.name).toStrictEqual(testTestDescriptor.name);
            expect(result.procedureDescription).toStrictEqual(testTestDescriptor.procedureDescription);
            expect(result.idSKU).toStrictEqual(testTestDescriptor.idSKU);
        });

        test("Get Test Descriptor by Id", async () => {
            const result = await testDescriptorDAO.getTestDescriptorByID(testTestDescriptor.id);

            expect(result.id).toStrictEqual(testTestDescriptor.id);
            expect(result.name).toStrictEqual(testTestDescriptor.name);
            expect(result.procedureDescription).toStrictEqual(testTestDescriptor.procedureDescription);
            expect(result.idSKU).toStrictEqual(testTestDescriptor.idSKU);
        });

        afterEach(async () => {
            await testDescriptorDAO.deleteAllTestDescriptor();
            await skuDAO.deleteAllSKU();
        })
    })

    describe("Creating Test Descriptor", () => {
        beforeEach(async () => {
            const { id } = await skuDAO.createSku(testSku.description, testSku.weight, testSku.volume,
                testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = id;
        });

        test("Create test descriptor with inexistent sku", async () => {
            try {
                await testDescriptorDAO.createTestDescriptor(testTestDescriptor.name,
                    testTestDescriptor.procedureDescription, -1);
            } catch (err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("FOREIGN");
            }
        });

        test("Create test descriptor with sku with an already assigned one", async () => {
            await testDescriptorDAO.createTestDescriptor(testTestDescriptor.name,
                testTestDescriptor.procedureDescription, testSku.id);

            try {
                await testDescriptorDAO.createTestDescriptor(testTestDescriptor.name,
                    testTestDescriptor.procedureDescription, testSku.id);
            } catch (err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("testDescriptor.idSKU");
            }
        });

        test("Create test descriptor", async () => {
            const testDescriptorId =
                await testDescriptorDAO.createTestDescriptor(testTestDescriptor.name,
                    testTestDescriptor.procedureDescription, testSku.id);
            testTestDescriptor.id = testDescriptorId;
            testTestDescriptor.idSKU = testSku.id;

            const result = await testDescriptorDAO.getTestDescriptorByID(testTestDescriptor.id);

            expect(result.id).toStrictEqual(testTestDescriptor.id);
            expect(result.name).toStrictEqual(testTestDescriptor.name);
            expect(result.procedureDescription).toStrictEqual(testTestDescriptor.procedureDescription);
            expect(result.idSKU).toStrictEqual(testTestDescriptor.idSKU);
        });

        afterEach(async () => {
            await testDescriptorDAO.deleteTestDescriptor(testTestDescriptor.id);
            await skuDAO.deleteAllSKU();
        });
    });

    describe("Modifing test descriptor", () => {
        beforeEach(async () => {
            const { id } = await skuDAO.createSku(testSku.description, testSku.weight, testSku.volume,
                testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = id;
            testTestDescriptor.idSKU = testSku.id;

            const testDescriptorId =
                await testDescriptorDAO.createTestDescriptor(testTestDescriptor.name,
                    testTestDescriptor.procedureDescription, testTestDescriptor.idSKU);
            testTestDescriptor.id = testDescriptorId;
        });
        test("Modify test descriptor fields", async () => {
            await testDescriptorDAO.modifyTestDescriptor(testTestDescriptor.id, "new name",
                "new desc", testTestDescriptor.idSKU);
            const result = await testDescriptorDAO.getTestDescriptorByID(testTestDescriptor.id);

            expect(result.name).toStrictEqual("new name");
            expect(result.procedureDescription).toStrictEqual("new desc");
            expect(result.idSKU).toStrictEqual(testTestDescriptor.idSKU);
        });

        test("Modify not existent test descriptor", async () => {
            const { changes } = await testDescriptorDAO.modifyTestDescriptor(-1, "new name",
                "new desc", testTestDescriptor.idSKU);
            expect(changes).toStrictEqual(0);
        });

        test("Modify Test Descriptor with already assigned Sku", async () => {
            const { id } = await skuDAO.createSku(secondTestSku.description, secondTestSku.weight, secondTestSku.volume,
                secondTestSku.notes, secondTestSku.price, secondTestSku.availableQuantity);
            secondTestSku.id = id;
            secondTestTestDescriptor.idSKU = secondTestSku.id;

            const testDescriptorId =
                await testDescriptorDAO.createTestDescriptor(secondTestTestDescriptor.name,
                    secondTestTestDescriptor.procedureDescription, secondTestTestDescriptor.idSKU);
            secondTestTestDescriptor.id = testDescriptorId;

            try {
                await testDescriptorDAO.modifyTestDescriptor(testTestDescriptor.id, "new name",
                    "new desc", secondTestTestDescriptor.idSKU);
            } catch (err) {
                expect(err.code).toStrictEqual("SQLITE_CONSTRAINT");
                expect(err.message).toMatch("testDescriptor.idSKU");
            }
        });

        afterEach(async () => {
            await testDescriptorDAO.deleteAllTestDescriptor();
            await skuDAO.deleteAllSKU();
        });
    });

    describe("Deleting test descriptor", () => {
        beforeEach(async () => {
            const { id } = await skuDAO.createSku(testSku.description, testSku.weight, testSku.volume,
                testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = id;
            testTestDescriptor.idSKU = testSku.id;

            const testDescriptorId =
                await testDescriptorDAO.createTestDescriptor(testTestDescriptor.name,
                    testTestDescriptor.procedureDescription, testTestDescriptor.idSKU);
            testTestDescriptor.id = testDescriptorId;
        });

        test("Deleting test descriptor", async () => {
            const { changes } = await testDescriptorDAO.deleteTestDescriptor(testTestDescriptor.id);
            expect(changes).toStrictEqual(1);
        });

        test("Deleting inexistent test descriptor", async () => {
            const { changes } = await testDescriptorDAO.deleteTestDescriptor(-1);
            expect(changes).toStrictEqual(0);
        });

        afterEach(async () => {
            await testDescriptorDAO.deleteAllTestDescriptor();
            await skuDAO.deleteAllSKU();
        });
    });

});