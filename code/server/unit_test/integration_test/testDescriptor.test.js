const TestDescriptorController = require('../../api/components/test_descriptor/controller');
const SkuController = require('../../api/components/sku/controller');

const TestDescriptor = require('../../api/components/test_descriptor/testDescriptor');
const Sku = require('../../api/components/sku/sku');

const { TestDescriptorErrorFactory } = require('../../api/components/test_descriptor/error');
const { SkuErrorFactory } = require('../../api/components/sku/error');

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
        });

        test("Create an invalid test descriptor (SKU not found)", async() => {
            try {
                await testDescriptorController.createTestDescriptor(
                    testTestDescriptor.name,
                    testTestDescriptor.procedureDescription,
                    -123
                );    
            } catch(err) {
                let error = SkuErrorFactory.newSkuNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });

        test("Create an invalid test descriptor (provided SKU already assigned)", async() => {
            try {
                const {id: sku_id} = await skuController.dao.createSku(
                    testSku.description,
                    testSku.weight,
                    testSku.volume,
                    testSku.notes,
                    testSku.price,
                    testSku.availableQuantity);
                const td_it = await testDescriptorController.dao.createTestDescriptor(
                    "test_name_1",
                    "test_procedure_description_1",
                    sku_id);
                await testDescriptorController.createTestDescriptor(
                    testTestDescriptor.name,
                    testTestDescriptor.procedureDescription,
                    sku_id
                )
            } catch(err) {
                let error = TestDescriptorErrorFactory.newSKUAlreadyWithTestDescriptor();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }

        });
    });

    describe("Modify test descriptor", () => {

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

        test("Modify test descriptor with an invalid id", async() => {
            try {
                const {id: sku_id} = await skuController.dao.createSku(
                    testSku.description,
                    testSku.weight,
                    testSku.volume,
                    testSku.notes,
                    testSku.price,
                    testSku.availableQuantity);

                let newTestDescriptor = {
                    newName : "prova",
                    newProcedureDescription :"this is a modified test",
                    newIdSKU : sku_id
                }
                await testDescriptorController.modifyTestDescriptor(-1, newTestDescriptor.newName, newTestDescriptor.newProcedureDescription,
                                newTestDescriptor.newIdSKU);

            } catch(err) {
                let error = TestDescriptorErrorFactory.newTestDescriptorNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        
        });

        test("Modify test descriptor with an invalid SKUId", async() => {
            try {
                
                let newTestDescriptor = {
                    newName : "prova",
                    newProcedureDescription :"this is a modified test",
                    newIdSKU : -1
                }
                await testDescriptorController.modifyTestDescriptor(testTestDescriptor.id, newTestDescriptor.newName, newTestDescriptor.newProcedureDescription,
                                newTestDescriptor.newIdSKU);

            } catch(err) {
                let error = SkuErrorFactory.newSkuNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        
        });

        test("Modify test descriptor of a SKU that have already a Test Descriptor", async() => {
            try {
                
                let newTestDescriptor = {
                    newName : "prova",
                    newProcedureDescription :"this is a modified test",
                    newIdSKU : testTestDescriptor.idSKU
                }
                await testDescriptorController.modifyTestDescriptor(testTestDescriptor.id, newTestDescriptor.newName, newTestDescriptor.newProcedureDescription,
                                newTestDescriptor.newIdSKU);

            } catch(err) {
                let error = SkuErrorFactory.newSKUAlreadyWithTestDescriptor();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        
        });

    });

    describe("Delete test descriptor", () => {

        
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
        test("Delete inexistent test descriptor", async () => {
            try{
                await testDescriptorController.deleteTestDescriptor(-1)
            } catch (err) {
                let error = TestDescriptorErrorFactory.newTestDescriptorNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
            
        });

        test("Delete test descriptor", async () => {
            try{
                await testDescriptorController.deleteTestDescriptor(testTestDescriptor.id)
            } catch (err) {
                let error = TestDescriptorErrorFactory.newTestDescriptorNotFound();
                expect(err.customCode).toStrictEqual(error.customCode);
                expect(err.customMessage).toMatch(error.customMessage);
            }
        });
    });
});