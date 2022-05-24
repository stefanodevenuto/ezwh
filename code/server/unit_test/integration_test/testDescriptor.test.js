const TestDescriptorController = require('../../api/components/test_descriptor/controller');
const SkuController = require('../../api/components/sku/controller');

const TestDescriptor = require('../../api/components/test_descriptor/testDescriptor');
const Sku = require('../../api/components/sku/sku');

const { TestDescriptorErrorFactory } = require('../../api/components/test_descriptor/error');

describe("Testing test descriptor controller", () => {
    const testDescriptorController = new TestDescriptorController();
    const skuController = new SkuController();

    let testTestDescriptor = TestDescriptor.mockTestTestDescriptor();
    let testSku = Sku.mockTestSku();
    
    beforeAll(async() => {
        await testDescriptorController.dao.deleteAllTestDescriptor();
    });

    describe("Get Test Descriptor", () => {
        beforeEach(async () => {
            const { id: skuId } = await skuController.dao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;

            testTestDescriptor.idSKU = testSku.id;    
            const testDescriptorId = 
                await testDescriptorController.dao.createTestDescriptor(testTestDescriptor.name, 
                    testTestDescriptor.procedureDescription, testTestDescriptor.idSKU);
            testTestDescriptor.id = testDescriptorId;
        });

        test("Get all Test Descriptors", async () => {
            const [result] = await testDescriptorController.getAllTestDescriptors();

            expect(result.id).toStrictEqual(testTestDescriptor.id);
            expect(result.name).toStrictEqual(testTestDescriptor.name);
            expect(result.procedureDescription).toStrictEqual(testTestDescriptor.procedureDescription);
            expect(result.idSKU).toStrictEqual(testTestDescriptor.idSKU);
        });

        test("Get Test Descriptor by Id", async () => {
            const result = await testDescriptorController.getTestDescriptorByID(testTestDescriptor.id);

            expect(result.id).toStrictEqual(testTestDescriptor.id);
            expect(result.name).toStrictEqual(testTestDescriptor.name);
            expect(result.procedureDescription).toStrictEqual(testTestDescriptor.procedureDescription);
            expect(result.idSKU).toStrictEqual(testTestDescriptor.idSKU);
        });

        test("Get inexistent Test Descriptor", async () => {
            try {
                await testDescriptorController.getTestDescriptorByID(-1);
            } catch(err) {
                let error = TestDescriptorErrorFactory.newTestDescriptorNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        afterEach(async () => {
            await testDescriptorController.dao.deleteAllTestDescriptor();
            await skuController.dao.deleteAllSKU();
        });
    });
    
    describe("Create test descriptor", () => {
        beforeEach(async () => {
            const { id: skuId } = await skuController.dao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
            testTestDescriptor.idSKU = testSku.id;    
        });

        test("Create a valid test descriptor", async() => {
            await expect(testDescriptorController.createTestDescriptor(
                testTestDescriptor.name,
                testTestDescriptor.procedureDescription,
                testTestDescriptor.idSKU))
            .resolves.not.toThrowError();
            // cannot delete the single entry because i don't have access to its id !!
            // await testDescriptorController.deleteTestDescriptor(    ); // ???
        });

        test("Create an invalid test descriptor (SKU not found)", async() => {
            await expect(testDescriptorController.createTestDescriptor(
                testTestDescriptor.name,
                testTestDescriptor.procedureDescription,
                -123
            )).rejects.toThrow(SkuErrorFactory.newSkuNotFound());
            // cannot delete the single entry because i don't have access to its id !!
        });

        test("Create an invalid test descriptor (provided SKU already assigned)", async() => {
            // assuming 1:1 relation between sku and test descriptor
            // define an association sku-testDescriptor (create sku first)
            const {id: sku_id} = await skuController.dao.createSku(
                testSku.description,
                testSku.weight,
                testSku.volume,
                testSku.notes,
                testSku.price,
                testSku.availableQuantity);
            console.log("DEBUG: " + sku_id);
            const td_it = await testDescriptorController.dao.createTestDescriptor(
                "test_name_1",
                "test_procedure_description_1",
                sku_id);
            // now we try to create a test descriptor with the same SKU
            await expect(testDescriptorController.createTestDescriptor(
                testTestDescriptor.name,
                testTestDescriptor.procedureDescription,
                sku_id   // same skuid as before: error expected
            )).rejects.toThrow(TestDescriptorErrorFactory.newSKUAlreadyWithTestDescriptor());
            // deleting test_name_1
            await skuController.dao.deleteSku(sku_id);
            await testDescriptorController.dao.deleteTestDescriptor(td_it);
            // remove sku (necessary?)
        });
    });

    describe("Modify test descriptor", () => {

    });

    describe("Delete test descriptor", () => {

    });
});