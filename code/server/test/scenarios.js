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
const { expect } = require('chai');
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
    secondTestSkuItem.RFID = testSkuItem.RFID.replace(/.$/,"2")

    let testRestockOrder = RestockOrder.mockRestockOrder();

    /*beforeEach(async () => {

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

        // Setup Items
        await itemDao.createItem(testItem.id, testItem.description, testItem.price, 
            testSku.id, testUser.id);
        testItem.SKUId = testSku.id;
        testItem.supplierId = testUser.id;

        await itemDao.createItem(secondTestItem.id, secondTestItem.description, secondTestItem.price, 
            secondTestSku.id, testUser.id);
        secondTestItem.SKUId = secondTestSku.id;
        secondTestItem.supplierId = testUser.id;

        // Setup Restock Order
        testRestockOrder.supplierId = testUser.id;
        testRestockOrder.products = [
            {item: testItem, qty: 10},
            {item: secondTestItem, qty: 10}
        ];
    });*/

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
                .send({position: positionId})

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
});