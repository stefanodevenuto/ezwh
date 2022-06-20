const RestockOrderDAO = require('../api/components/restock_order/dao');
const InternalOrderDAO = require('../api/components/internalOrder/dao');
const PositionDAO = require('../api/components/position/dao');
const ItemDAO = require('../api/components/item/dao');
const SkuDAO = require('../api/components/sku/dao');
const UserDAO = require('../api/components/user/dao');
const SKUItemDAO = require('../api/components/skuItem/dao');
const TestResultDAO = require('../api/components/test_result/dao');
const TestDescriptorDAO = require('../api/components/test_descriptor/dao');

const RestockOrder = require('../api/components/restock_order/restockOrder');
const Item = require('../api/components/item/item');
const Sku = require('../api/components/sku/sku');
const User = require('../api/components/user/user');
const SKUItem = require('../api/components/skuItem/SKUItem');
const TestResult = require('../api/components/test_result/testResult');
const TestDescriptor = require('../api/components/test_descriptor/testDescriptor');
const InternalOrder = require('../api/components/internalOrder/internalOrder');
const Position = require('../api/components/position/position');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

describe("Testing Scenarios", () => {
    const restockOrderDao = new RestockOrderDAO();
    const internalOrderDao = new InternalOrderDAO();
    const positionDao = new PositionDAO();
    const itemDao = new ItemDAO();
    const skuDao = new SkuDAO();
    const userDao = new UserDAO();
    const skuItemDao = new SKUItemDAO();
    const testResultDao = new TestResultDAO();
    const testDescriptorDao = new TestDescriptorDAO();

    let testSku = Sku.mockTestSku();
    let testPosition = Position.mockTestPosition();

    let testUser = User.mockUser();
    let secondTestSku = Sku.mockTestSku();

    let testItem = Item.mockItem();
    let secondTestItem = Item.mockItem();
    secondTestItem.id = testItem.id + 1;

    let testSkuItem = SKUItem.mockTestSkuItem();
    let secondTestSkuItem = SKUItem.mockTestSkuItem();
    secondTestSkuItem.RFID = testSkuItem.RFID.replace(/.$/, "2")

    let testTestDescriptor = TestDescriptor.mockTestTestDescriptor();
    let testTestResult = TestResult.mockTestTestResult();
    let secondTestTestResult = TestResult.mockTestTestResult();

    let testRestockOrder = RestockOrder.mockRestockOrder();
    let testInternalOrder = InternalOrder.mockTestInternalOrder();

    describe("Scenario 1-1", () => {
        it("Create Sku", async () => {
            let newSku = {
                description: testSku.description,
                weight: testSku.weight,
                volume: testSku.volume,
                notes: testSku.notes,
                price: testSku.price,
                availableQuantity: testSku.availableQuantity
            }

            const response = await agent.post(`/api/sku/`)
                .send(newSku)
            response.should.have.status(201);
        });

        afterEach(async () => {
            await skuDao.deleteAllSKU();
        });
    });

    describe("Scenario 1-2", () => {
        beforeEach(async () => {
            const { id } = await skuDao.createSku(testSku.description, testSku.weight, testSku.volume,
                testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = id;

            await positionDao.createPosition(testPosition.positionID, testPosition.aisleID,
                testPosition.row, testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
        });

        it("Modify Sku location", async () => {
            const resSku = await agent.get(`/api/sku/${testSku.id}`);
            resSku.should.have.status(200);

            const resPosition = await agent.get(`/api/positions/`);
            resPosition.should.have.status(200);

            const positionId = resPosition.body[0].positionID;
            const resChangePos = await agent.put(`/api/sku/${testSku.id}/position/`)
                .send({ position: positionId })

            resPosition.should.have.status(200);
        });

        afterEach(async () => {
            await skuDao.deleteSku(testSku.id);
            await positionDao.deletePosition(testPosition.positionID);
        });
    });

    describe("Scenario 1-3", () => {
        beforeEach(async () => {
            const { id } = await skuDao.createSku(testSku.description, testSku.weight, testSku.volume,
                testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = id;
        });

        it("Modify Sku weight and volume", async () => {
            const resSku = await agent.get(`/api/sku/${testSku.id}`);
            resSku.should.have.status(200);

            const sku = resSku.body;
            let newSku = {
                newDescription: sku.description,
                newWeight: 10,
                newVolume: 10,
                newNotes: sku.notes,
                newPrice: sku.price,
                newAvailableQuantity: sku.availableQuantity
            }

            const resModifySku = await agent.put(`/api/sku/${testSku.id}`)
                .send(newSku);
            resModifySku.should.have.status(200);
        });

        afterEach(async () => {
            await skuDao.deleteAllSKU();
        });
    });

    describe("Scenario 2-1", () => {
        it("Create Position", async () => {
            let position = {
                positionID: testPosition.positionID,
                aisleID: testPosition.aisleID,
                row: testPosition.row,
                col: testPosition.col,
                maxWeight: testPosition.maxWeight,
                maxVolume: testPosition.maxVolume
            }

            const resPosition = await agent.post(`/api/position/`).send(position);
            resPosition.should.have.status(201);
        });

        afterEach(async () => {
            await positionDao.deleteAllPosition();
        });
    });

    describe("Scenario 2-2", () => {
        beforeEach(async () => {
            await positionDao.createPosition(testPosition.positionID, testPosition.aisleID,
                testPosition.row, testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
        });

        it("Modify positionID of P", async () => {
            const newPositionID = testPosition.positionID.replace(/.$/, "2");
            const resPosition = await agent.put(`/api/position/${testPosition.positionID}/changeID/`)
                .send({ newPositionID: newPositionID });
            resPosition.should.have.status(200);

            testPosition.positionID = newPositionID;
        });

        afterEach(async () => {
            await positionDao.deletePosition(testPosition.positionID);
        });
    });

    describe("Scenario 2-3", () => {
        beforeEach(async () => {
            await positionDao.createPosition(testPosition.positionID, testPosition.aisleID,
                testPosition.row, testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
        });

        it("Modify weight and volume of P", async () => {
            let position = {
                newAisleID: testPosition.aisleID,
                newRow: testPosition.row,
                newCol: testPosition.col,
                newMaxWeight: 2000,
                newMaxVolume: 2000,
                newOccupiedWeight: testPosition.occupiedWeight,
                newOccupiedVolume: testPosition.occupiedVolume
            }

            const resPosition = await agent.put(`/api/position/${testPosition.positionID}/`)
                .send(position);
            resPosition.should.have.status(200);
        });

        afterEach(async () => {
            await positionDao.deleteAllPosition();
        });
    });

    describe("Scenario 2-4", () => {
        beforeEach(async () => {
            await positionDao.createPosition(testPosition.positionID, testPosition.aisleID,
                testPosition.row, testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
        });

        it("Modify aisle ID, row and column of P", async () => {
            let position = {
                newAisleID: testPosition.aisleID,
                newRow: testPosition.row,
                newCol: testPosition.col.replace(/.$/, "2"),
                newMaxWeight: testPosition.maxWeight,
                newMaxVolume: testPosition.maxVolume,
                newOccupiedWeight: testPosition.occupiedWeight,
                newOccupiedVolume: testPosition.occupiedVolume
            }

            const resPosition = await agent.put(`/api/position/${testPosition.positionID}/`)
                .send(position);
            resPosition.should.have.status(200);
        });

        afterEach(async () => {
            await positionDao.deleteAllPosition();
        });
    });

    describe("Scenario 2-5", () => {
        beforeEach(async () => {
            await positionDao.createPosition(testPosition.positionID, testPosition.aisleID,
                testPosition.row, testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
        });

        it("Delete position P", async () => {
            const resPosition = await agent.delete(`/api/position/${testPosition.positionID}/`);
            resPosition.should.have.status(204);
        });
    });

    describe("Scenario 3-1 / Scenario 3-2", () => {
        beforeEach(async () => {

            // Setup Skus
            const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;

            // Setup User
            const { id: userId } = await userDao.createUser(testUser.email, testUser.name,
                testUser.surname, testUser.password, testUser.type)
            testUser.id = userId;

            // Setup Items
            await itemDao.createItem(testItem.id, testItem.description, testItem.price,
                testSku.id, testUser.id);
            testItem.SKUId = testSku.id;
            testItem.supplierId = testUser.id;

            // Setup Restock Order
            testRestockOrder.supplierId = testUser.id;
            testRestockOrder.products = [
                { item: testItem, qty: 10 },
                { item: secondTestItem, qty: 10 }
            ];
        });

        it("Restock Order of SKU S issued by quantity / by supplier", async () => {

            // This call should be "getItemBySupplierIdAndSku"
            const resItem = await agent.get(`/api/item/${testItem.id}/${testItem.supplierId}`);
            resItem.should.have.status(200);

            // Setup Restock Order
            testRestockOrder.supplierId = testUser.id;
            testRestockOrder.products = [
                { item: resItem.body }
            ];

            let restockOrderToSend = {
                issueDate: testRestockOrder.issueDate,
                supplierId: testRestockOrder.supplierId,
                products: testRestockOrder.products.map((p) => ({
                    SKUId: p.item.SKUId,
                    itemId: p.item.id,
                    description: p.item.description,
                    price: p.item.price,
                    qty: p.qty
                }))
            }

            const response = await agent.post(`/api/restockOrder/`).send(restockOrderToSend);
            response.should.have.status(201);
        });

        afterEach(async () => {
            await skuDao.deleteSku(testSku.id);
            await userDao.deleteUser(testUser.email, testUser.type);
            await itemDao.deleteItem(testItem.id);
            await restockOrderDao.deleteRestockOrder(testRestockOrder.id);
        })
    });

    describe("Scenario 4-1", () => {
        it("Create user and define rights", async () => {
            let user = {
                username: testUser.email,
                name: testUser.name,
                surname: testUser.surname,
                password: "PASSWORD",
                type: testUser.type
            }

            const response = await agent.post(`/api/newUser/`).send(user);
            response.should.have.status(201);
        })

        afterEach(async () => {
            await userDao.deleteAllUser();
        })
    });

    describe("Scenario 4-2", () => {
        beforeEach(async () => {
            let user = {
                username: testUser.email,
                name: testUser.name,
                surname: testUser.surname,
                password: "PASSWORD",
                type: testUser.type
            }

            const response = await agent.post(`/api/newUser/`).send(user);
            response.should.have.status(201);
        });

        it("Modify user rights", async () => {
            const response = await agent.put(`/api/users/${testUser.email}`)
                .send({
                    oldType: testUser.type,
                    newType: User.CUSTOMER
                });
            response.should.have.status(200);
        })

        afterEach(async () => {
            await userDao.deleteAllUser();
        })
    });

    describe("Scenario 4-3", () => {
        beforeEach(async () => {
            let user = {
                username: testUser.email,
                name: testUser.name,
                surname: testUser.surname,
                password: "PASSWORD",
                type: testUser.type
            }

            const response = await agent.post(`/api/newUser/`).send(user);
            response.should.have.status(201);
        });

        it("Delete user", async () => {
            const response = await agent.delete(`/api/users/${testUser.email}/${testUser.type}`)
            response.should.have.status(204);
        })
    });

    describe("Scenario 5-1-1", () => {
        beforeEach(async () => {

            // Setup Skus
            const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;

            // Setup User
            const { id: userId } = await userDao.createUser(testUser.email, testUser.name,
                testUser.surname, testUser.password, testUser.type)
            testUser.id = userId;

            // Setup Item
            await itemDao.createItem(testItem.id, testItem.description, testItem.price,
                testSku.id, testUser.id);
            testItem.SKUId = testSku.id;
            testItem.supplierId = testUser.id;

            // Setup Restock Order
            testRestockOrder.supplierId = testUser.id;
            testRestockOrder.products = [
                { item: testItem, qty: 10 }
            ];

            const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, testRestockOrder.supplierId,
                testRestockOrder.state, testRestockOrder.products);
            testRestockOrder.id = restockOrderId;

            testSkuItem.SKUId = testSku.id;
            secondTestSkuItem.SKUId = testSku.id;

            await skuItemDao.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock);
            await skuItemDao.createSKUItem(secondTestSkuItem.RFID, secondTestSkuItem.SKUId, secondTestSkuItem.dateOfStock);
        });

        it("Record restock order arrival", async () => {
            const resRestock = await agent.put(`/api/restockOrder/${testRestockOrder.id}`)
                .send({ newState: RestockOrder.DELIVERED });
            resRestock.should.have.status(200);

            const resGetFirstSkuItem = await agent.get(`/api/skuitems/sku/${testSku.id}`);
            resGetFirstSkuItem.should.have.status(200);

            resGetFirstSkuItem.body.map((skuItem) => {
                testRestockOrder.skuItems.push(skuItem);
            })

            const resSkuItem = await agent.put(`/api/restockOrder/${testRestockOrder.id}/skuItems`)
                .send({
                    skuItems: testRestockOrder.skuItems.map((s) => ({ SKUId: s.SKUId, rfid: s.RFID }))
                });
            resSkuItem.should.have.status(200);
        })

        afterEach(async () => {
            await skuDao.deleteSku(testSku.id);
            await userDao.deleteUser(testUser.email, testUser.type);
            await restockOrderDao.deleteRestockOrder(testRestockOrder.id);
        })
    });

    describe("Scenario 5-2-1 / Scenario 5-2-2 / Scenario 5-2-3", () => {
        beforeEach(async () => {

            // Setup Skus
            const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
            testTestDescriptor.idSKU = skuId;

            // Setup User
            const { id: userId } = await userDao.createUser(testUser.email, testUser.name,
                testUser.surname, testUser.password, testUser.type)
            testUser.id = userId;

            // Setup Item
            await itemDao.createItem(testItem.id, testItem.description, testItem.price,
                testSku.id, testUser.id);
            testItem.SKUId = testSku.id;
            testItem.supplierId = testUser.id;

            // Setup Restock Order
            testRestockOrder.supplierId = testUser.id;
            testRestockOrder.products = [
                { item: testItem, qty: 10 }
            ];

            const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, testRestockOrder.supplierId,
                testRestockOrder.state, testRestockOrder.products);
            testRestockOrder.id = restockOrderId;

            testSkuItem.SKUId = testSku.id;
            secondTestSkuItem.SKUId = testSku.id;

            await skuItemDao.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock);
            await skuItemDao.createSKUItem(secondTestSkuItem.RFID, secondTestSkuItem.SKUId, secondTestSkuItem.dateOfStock);

            await restockOrderDao.modifyRestockOrderSkuItems(testRestockOrder.id, [
                { rfid: testSkuItem.RFID }, { rfid: secondTestSkuItem.RFID },
            ])

            const testDescriptorId =
                await testDescriptorDao.createTestDescriptor(testTestDescriptor.name,
                    testTestDescriptor.procedureDescription, testTestDescriptor.idSKU);
            testTestDescriptor.id = testDescriptorId;
            testTestResult.testDescriptorId = testDescriptorId;
        });

        it("Record positive and/or negative test results of all SKU items of a RestockOrder", async () => {
            const resRestock = await agent.get(`/api/restockOrders/${testRestockOrder.id}`);
            resRestock.should.have.status(200);

            for (let skuItem of resRestock.body.skuItems) {
                const resTestResult = await agent.post(`/api/skuitem/testResult/`)
                    .send({
                        rfid: skuItem.rfid,
                        idTestDescriptor: testTestResult.testDescriptorId,
                        Date: testTestResult.date,
                        Result: testTestResult.result
                    });
                resTestResult.should.have.status(201);
            }

            const resState = await agent.put(`/api/restockOrder/${testRestockOrder.id}`)
                .send({ newState: RestockOrder.TESTED });
            resState.should.have.status(200);
        })

        afterEach(async () => {
            await skuDao.deleteSku(testSku.id);
            await userDao.deleteUser(testUser.email, testUser.type);
            await restockOrderDao.deleteRestockOrder(testRestockOrder.id);
            await skuItemDao.deleteAllSKUItem();
            await testDescriptorDao.deleteTestDescriptor(testTestDescriptor.id);
            await testResultDao.deleteAllTestResult();
        })
    });

    describe("Scenario 5-3-1", () => {
        beforeEach(async () => {

            // Setup Skus
            const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
            testTestDescriptor.idSKU = skuId;

            await positionDao.createPosition(testPosition.positionID, testPosition.aisleID,
                testPosition.row, testPosition.col, testPosition.maxWeight, testPosition.maxVolume);
            await skuDao.addModifySkuPosition(testSku.id, testPosition.positionID);

            // Setup User
            const { id: userId } = await userDao.createUser(testUser.email, testUser.name,
                testUser.surname, testUser.password, testUser.type)
            testUser.id = userId;

            // Setup Item
            await itemDao.createItem(testItem.id, testItem.description, testItem.price,
                testSku.id, testUser.id);
            testItem.SKUId = testSku.id;
            testItem.supplierId = testUser.id;

            // Setup Restock Order
            testRestockOrder.supplierId = testUser.id;
            testRestockOrder.products = [
                { item: testItem, qty: 10 }
            ];

            const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, testRestockOrder.supplierId,
                testRestockOrder.state, testRestockOrder.products);
            testRestockOrder.id = restockOrderId;

            testSkuItem.SKUId = testSku.id;
            secondTestSkuItem.SKUId = testSku.id;

            await skuItemDao.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock);
            await skuItemDao.createSKUItem(secondTestSkuItem.RFID, secondTestSkuItem.SKUId, secondTestSkuItem.dateOfStock);

            await restockOrderDao.modifyRestockOrderSkuItems(testRestockOrder.id, [
                { rfid: testSkuItem.RFID }, { rfid: secondTestSkuItem.RFID },
            ])

            const testDescriptorId =
                await testDescriptorDao.createTestDescriptor(testTestDescriptor.name,
                    testTestDescriptor.procedureDescription, testTestDescriptor.idSKU);
            testTestDescriptor.id = testDescriptorId;
            testTestResult.testDescriptorId = testDescriptorId;
        });

        it("Stock all SKU items of a RO", async () => {
            const resRestock = await agent.get(`/api/restockOrders/${testRestockOrder.id}`);
            resRestock.should.have.status(200);

            for (let skuItem of resRestock.body.skuItems) {
                const resSku = await agent.put(`/api/sku/${skuItem.SKUId}/`)
                    .send({
                        newDescription: testSku.description,
                        newWeight: testSku.weight,
                        newVolume: testSku.volume,
                        newNotes: testSku.notes,
                        newPrice: testSku.price,
                        newAvailableQuantity: testSku.availableQuantity + 1
                    });
                resSku.should.have.status(200);
            }

            const resState = await agent.put(`/api/restockOrder/${testRestockOrder.id}`)
                .send({ newState: RestockOrder.COMPLETED });
            resState.should.have.status(200);
        })

        afterEach(async () => {
            await skuDao.deleteSku(testSku.id);
            await userDao.deleteUser(testUser.email, testUser.type);
            await restockOrderDao.deleteRestockOrder(testRestockOrder.id);
            await skuItemDao.deleteAllSKUItem();
            await testDescriptorDao.deleteTestDescriptor(testTestDescriptor.id);
            await testResultDao.deleteAllTestResult();
        })
    });

    describe("Scenario 5-3-2 / Scenario 5-3-3", () => {
        beforeEach(async () => {
            // Setup Skus
            const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
            testTestDescriptor.idSKU = skuId;

            // Setup User
            const { id: userId } = await userDao.createUser(testUser.email, testUser.name,
                testUser.surname, testUser.password, testUser.type)
            testUser.id = userId;

            // Setup Item
            await itemDao.createItem(testItem.id, testItem.description, testItem.price,
                testSku.id, testUser.id);
            testItem.SKUId = testSku.id;
            testItem.supplierId = testUser.id;

            // Setup Restock Order
            testRestockOrder.supplierId = testUser.id;
            testRestockOrder.products = [
                { item: testItem, qty: 10 }
            ];

            const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, testRestockOrder.supplierId,
                testRestockOrder.state, testRestockOrder.products);
            testRestockOrder.id = restockOrderId;

            testSkuItem.SKUId = testSku.id;
            secondTestSkuItem.SKUId = testSku.id;

            await skuItemDao.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock);
            await skuItemDao.createSKUItem(secondTestSkuItem.RFID, secondTestSkuItem.SKUId, secondTestSkuItem.dateOfStock);

            await restockOrderDao.modifyRestockOrderSkuItems(testRestockOrder.id, [
                { rfid: testSkuItem.RFID }, { rfid: secondTestSkuItem.RFID },
            ])

            const testDescriptorId =
                await testDescriptorDao.createTestDescriptor(testTestDescriptor.name,
                    testTestDescriptor.procedureDescription, testTestDescriptor.idSKU);
            testTestDescriptor.id = testDescriptorId;
            testTestResult.testDescriptorId = testDescriptorId;

        });

        describe("Scenario 5-3-2", () => {
            beforeEach(async () => {
                await testResultDao.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                    testTestResult.date, false);
                await testResultDao.createTestResult(secondTestSkuItem.RFID, testTestDescriptor.id,
                    testTestResult.date, false);
            })

            it("Stock zero SKU items of a RO", async () => {
                const resState = await agent.put(`/api/restockOrder/${testRestockOrder.id}`)
                    .send({ newState: RestockOrder.COMPLETEDRETURN });
                resState.should.have.status(200);

                const resReturnItems = await agent.get(`/api/restockOrders/${testRestockOrder.id}/returnItems`);
                resReturnItems.should.have.status(200);

                resReturnItems.body.should.have.lengthOf(2);
            })
        })

        describe("Scenario 5-3-3", () => {
            beforeEach(async () => {
                await testResultDao.createTestResult(testSkuItem.RFID, testTestDescriptor.id,
                    testTestResult.date, false);
                await testResultDao.createTestResult(secondTestItem.RFID, testTestDescriptor.id,
                    testTestResult.date, true);
            })

            it("Stock some SKU items of a RO", async () => {
                const resState = await agent.put(`/api/restockOrder/${testRestockOrder.id}`)
                    .send({ newState: RestockOrder.COMPLETEDRETURN });
                resState.should.have.status(200);

                const resReturnItems = await agent.get(`/api/restockOrders/${testRestockOrder.id}/returnItems`);
                resReturnItems.should.have.status(200);

                const resRestock = await agent.get(`/api/restockOrders/${testRestockOrder.id}`);
                resRestock.should.have.status(200);

                let positiveSkuItems = resRestock.body.skuItems.filter(
                    x => !resReturnItems.body.some((y) => y.rfid == x.rfid)
                );

                for (let skuItem of positiveSkuItems) {
                    const resSku = await agent.put(`/api/sku/${skuItem.SKUId}/`)
                        .send({
                            newDescription: testSku.description,
                            newWeight: testSku.weight,
                            newVolume: testSku.volume,
                            newNotes: testSku.notes,
                            newPrice: testSku.price,
                            newAvailableQuantity: testSku.availableQuantity + 1
                        });
                    resSku.should.have.status(200);
                }
            })
        })

        afterEach(async () => {
            await skuDao.deleteSku(testSku.id);
            await userDao.deleteUser(testUser.email, testUser.type);
            await restockOrderDao.deleteRestockOrder(testRestockOrder.id);
            await skuItemDao.deleteAllSKUItem();
            await testDescriptorDao.deleteTestDescriptor(testTestDescriptor.id);
            await testResultDao.deleteAllTestResult();
        })
    });

    describe("Scenario 9", () => {
        beforeEach(async () => {
            // Setup Skus
            const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;

            const { id: secondSkuId } = await skuDao.createSku(secondTestSku.description, secondTestSku.weight,
                secondTestSku.volume, secondTestSku.notes, secondTestSku.price, secondTestSku.availableQuantity);
            secondTestSku.id = secondSkuId;

            // Setup User
            const { id: userId } = await userDao.createUser(testUser.email, testUser.name,
                testUser.surname, testUser.password, testUser.type)
            testUser.id = userId;

            // Setup Internal Order
            testInternalOrder.customerId = testUser.id;
            testInternalOrder.products = [
                { SKUId: testSku.id, description: testSku.description, price: testSku.price, qty: 10 },
                { SKUId: secondTestSku.id, description: secondTestSku.description, price: secondTestSku.price, qty: 10 },
            ];
        })

        describe("Scenario 9-1", () => {
            it("Create Internal Order", async () => {
                let internalOrderToSend = {
                    issueDate: testInternalOrder.issueDate,
                    customerId: testInternalOrder.customerId,
                    products: testInternalOrder.products
                }

                const response_create = await agent.post(`/api/internalOrders/`).send(internalOrderToSend);
                response_create.should.have.status(201);

                // Manager
                const gInt = await agent.get(`/api/internalOrders`)
                const internalOrder = gInt.body[0];

                testInternalOrder.id = internalOrder.id;
                for (let skuProduct of internalOrder.products) {
                    const resGetSku = await agent.get(`/api/sku/${skuProduct.SKUId}`);
                    resGetSku.should.have.status(200);

                    const sku = resGetSku.body;

                    const resSku = await agent.put(`/api/sku/${skuProduct.SKUId}/`)
                        .send({
                            newDescription: sku.description,
                            newWeight: sku.weight,
                            newVolume: sku.volume,
                            newNotes: sku.notes,
                            newPrice: sku.price,
                            newAvailableQuantity: sku.availableQuantity - 1
                        });
                    resSku.should.have.status(200);
                }

                const refuseInternalOrder = await agent.put(`/api/internalOrders/${testInternalOrder.id}/`)
                    .send({ newState: InternalOrder.ACCEPTED})
                refuseInternalOrder.should.have.status(200);
            });
        });

        describe("Scenario 9-2", () => {
            it("Create and Refuse Internal Order", async () => {
                let internalOrderToSend = {
                    issueDate: testInternalOrder.issueDate,
                    customerId: testInternalOrder.customerId,
                    products: testInternalOrder.products
                }

                // Customer
                const response_create = await agent.post(`/api/internalOrders/`).send(internalOrderToSend);
                response_create.should.have.status(201);

                // Manager
                const gInt = await agent.get(`/api/internalOrders`)
                const internalOrder = gInt.body[0];

                testInternalOrder.id = internalOrder.id;
                const refuseInternalOrder = await agent.put(`/api/internalOrders/${testInternalOrder.id}/`)
                    .send({ newState: InternalOrder.REFUSED })
                refuseInternalOrder.should.have.status(200);
            });
        });

        describe("Scenario 9-3", () => {
            it("Create and Delete Internal Order", async () => {
                let internalOrderToSend = {
                    issueDate: testInternalOrder.issueDate,
                    customerId: testInternalOrder.customerId,
                    products: testInternalOrder.products
                }

                // Customer
                const response_create = await agent.post(`/api/internalOrders/`).send(internalOrderToSend);
                response_create.should.have.status(201);

                // Manager
                const gInt = await agent.get(`/api/internalOrders`)
                const internalOrder = gInt.body[0];

                testInternalOrder.id = internalOrder.id;

                const refuseInternalOrder = await agent.put(`/api/internalOrders/${testInternalOrder.id}/`)
                    .send({ newState: InternalOrder.CANCELED })
                refuseInternalOrder.should.have.status(200);
            });
        });

        afterEach(async () => {
            await skuDao.deleteSku(testSku.id);
            await userDao.deleteUser(testUser.email, testUser.type);
            await itemDao.deleteItem(testItem.id);
            await internalOrderDao.deleteAllInternalOrder();
            await skuItemDao.deleteAllSKUItem();
            await testDescriptorDao.deleteTestDescriptor(testTestDescriptor.id);
            await testResultDao.deleteAllTestResult();
        });
    });

    describe("Scenario 10", () => {
        describe("Scenario 10-1", () => {
            beforeEach(async () => {
                // Setup Skus
                const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
                    testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
                testSku.id = skuId;

                const { id: secondSkuId } = await skuDao.createSku(secondTestSku.description, secondTestSku.weight,
                    secondTestSku.volume, secondTestSku.notes, secondTestSku.price, secondTestSku.availableQuantity);
                secondTestSku.id = secondSkuId;

                // Setup User
                const { id: userId } = await userDao.createUser(testUser.email, testUser.name,
                    testUser.surname, testUser.password, testUser.type)
                testUser.id = userId;

                // Setup Internal Order
                testInternalOrder.customerId = testUser.id;
                testInternalOrder.products = [
                    { SKUId: testSku.id, description: testSku.description, price: testSku.price, qty: 10 },
                    { SKUId: secondTestSku.id, description: secondTestSku.description, price: secondTestSku.price, qty: 10 },
                ];

                const internalOrderId = await internalOrderDao.createInternalOrder(testInternalOrder.issueDate, testInternalOrder.customerId,
                    InternalOrder.ISSUED, testInternalOrder.products);
                testInternalOrder.id = internalOrderId;

                await skuItemDao.createSKUItem(testSkuItem.RFID, testSku.id, testSkuItem.dateOfStock);
                await skuItemDao.createSKUItem(secondTestSkuItem.RFID, secondTestSku.id, secondTestSkuItem.dateOfStock);

                testSkuItem.SKUId = testSku.id;
                secondTestSkuItem.SKUId = secondTestSku.id;
            })

            it("Internal Order IO Completed", async () => {
                const resGetInternal = await agent.get(`/api/internalOrders/${testInternalOrder.id}`);
                resGetInternal.should.have.status(200);

                // For each skuItem to be added in the Internal Order
                let resSkuItem = await agent.put(`/api/skuitems/${testSkuItem.RFID}`)
                    .send({
                        newRFID: testSkuItem.RFID,
                        newAvailable: 0,
                        newDateOfStock: testSkuItem.dateOfStock
                    });
                resSkuItem.should.have.status(200);

                resSkuItem = await agent.put(`/api/skuitems/${secondTestSkuItem.RFID}`)
                    .send({
                        newRFID: secondTestSkuItem.RFID,
                        newAvailable: 0,
                        newDateOfStock: secondTestSkuItem.dateOfStock
                    });
                resSkuItem.should.have.status(200);

                // Change State
                testInternalOrder.products = [
                    {
                        SkuID: testSkuItem.SKUId, description: testSku.description,
                        price: testSku.price, RFID: testSkuItem.RFID
                    },
                    {
                        SkuID: secondTestSkuItem.SKUId, description: secondTestSku.description,
                        price: secondTestSku.price, RFID: secondTestSkuItem.RFID
                    },
                ];

                const resPutInternal = await agent.put(`/api/internalOrders/${testInternalOrder.id}`)
                    .send({newState: InternalOrder.COMPLETED, products: testInternalOrder.products});
                resPutInternal.should.have.status(200);
            })

            afterEach(async () => {
                await skuDao.deleteSku(testSku.id);
                await userDao.deleteUser(testUser.email, testUser.type);
                await itemDao.deleteItem(testItem.id);
                await internalOrderDao.deleteAllInternalOrder();
                await skuItemDao.deleteAllSKUItem();
                await testDescriptorDao.deleteTestDescriptor(testTestDescriptor.id);
                await testResultDao.deleteAllTestResult();
            });
        });
    });

    describe("Scenario 11-1", () => {
        beforeEach(async () => {
             // Setup User
            const { id: userId } = await userDao.createUser(testUser.email, testUser.name, 
                testUser.surname, testUser.password, User.SUPPLIER)
            testUser.id = userId;

            const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;

            testItem.SKUId = testSku.id;
            testItem.supplierId = testUser.id;
        });

        it("Create Item I", async () => {
            const response = await agent.post(`/api/item/`).send(testItem);
            response.should.have.status(201);
        });

        afterEach(async () => {
            await skuDao.deleteAllSKU();
            await userDao.deleteAllUser();
            await itemDao.deleteAllItem();
        });
    });

    describe("Scenario 11-2", () => {
        beforeEach(async () => {
             // Setup User
            const { id: userId } = await userDao.createUser(testUser.email, testUser.name, 
                testUser.surname, testUser.password, User.SUPPLIER)
            testUser.id = userId;

            const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;

            // Setup Items
            await itemDao.createItem(testItem.id, testItem.description, testItem.price, 
                testSku.id, testUser.id);
            testItem.SKUId = testSku.id;
            testItem.supplierId = testUser.id;
        });

        it("Modify Item description and price", async () => {
            const resItem = await agent.get(`/api/item/${testItem.id}/${testItem.supplierId}`);
            resItem.should.have.status(200);

            const resPut = await agent.put(`/api/item/${testItem.id}/${testItem.supplierId}`)
                .send({newDescription: "a new descripton", newPrice: 10.23});
            resPut.should.have.status(200);
        });

        afterEach(async () => {
            await skuDao.deleteAllSKU();
            await userDao.deleteAllUser();
            await internalOrderDao.deleteAllInternalOrder();
        });
    });

    describe("Scenario 12-1", () => {
        beforeEach(async () => {
            // Setup Skus
            const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;
        });

        it("Create test description", async () => {
            let testDescriptorToSend = {
                name: testTestDescriptor.name,
                procedureDescription: testTestDescriptor.procedureDescription,
                idSKU: testSku.id
            }

            const response = await agent.post(`/api/testDescriptor/`)
                .send(testDescriptorToSend)
            response.should.have.status(201);
        });

        afterEach(async () => {
            await testDescriptorDao.deleteAllTestDescriptor();
        });
    });

    describe("Scenario 12-2 / Scenario 12-3", () => {
        beforeEach(async () => {
            // Setup Skus
            const { id: skuId } = await skuDao.createSku(testSku.description, testSku.weight,
                testSku.volume, testSku.notes, testSku.price, testSku.availableQuantity);
            testSku.id = skuId;

            const testDescriptorId =
                await testDescriptorDao.createTestDescriptor(testTestDescriptor.name,
                    testTestDescriptor.procedureDescription, testSku.id);
            testTestDescriptor.id = testDescriptorId;
            testTestDescriptor.idSKU = testSku.id;
        });

        it("Update test description", async () => {
            let newTestDescriptorToSend = {
                newName: testTestDescriptor.name,
                newProcedureDescription: "a new procedure description",
                newIdSKU: testTestDescriptor.idSKU
            }

            const resUpdate = await agent.put(`/api/testDescriptor/${testTestDescriptor.id}`)
                .send(newTestDescriptorToSend)
            resUpdate.should.have.status(200);
        });

        it("Delete test description", async () => {
            const resUpdate = await agent.delete(`/api/testDescriptor/${testTestDescriptor.id}`);
            resUpdate.should.have.status(204);
        });

        afterEach(async () => {
            await testDescriptorDao.deleteTestDescriptor(testTestDescriptor.id);
            await skuDao.deleteAllSKU();
        });
    });
});