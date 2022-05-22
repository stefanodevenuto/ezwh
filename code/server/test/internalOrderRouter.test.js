const InternaOrderDAO = require('../api/components/internalOrder/dao');
const ItemDAO = require('../api/components/item/dao');
const SkuDAO = require('../api/components/sku/dao');
const UserDAO = require('../api/components/user/dao');
const SKUItemDAO = require('../api/components/skuItem/dao');
const TestResultDAO = require('../api/components/test_result/dao');

const InternalOrder = require('../api/components/internalOrder/internalOrder');
const Item = require('../api/components/item/item');
const Sku = require('../api/components/sku/sku');
const User = require('../api/components/user/user');
const SKUItem = require('../api/components/skuItem/SKUItem');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const { expect } = require('chai');
var agent = chai.request.agent(app);

describe("Testing Internal Order Route", () => {
    const internalOrderDao = new InternaOrderDAO();
    const itemDao = new ItemDAO();
    const skuDao = new SkuDAO();
    const userDao = new UserDAO();
    const skuItemDao = new SKUItemDAO();
    const testResultDAO = new TestResultDAO();

    let testUser = User.mockUser();
    let testSku = Sku.mockTestSku();
    let secondTestSku = Sku.mockTestSku();

    let testItem = Item.mockItem();
    let secondTestItem = Item.mockItem();
    secondTestItem.id = testItem.id + 1;

    let testSkuItem = SKUItem.mockTestSkuItem();
    let secondTestSkuItem = SKUItem.mockTestSkuItem();
    secondTestSkuItem.RFID = testSkuItem.RFID.replace(/.$/,"2")

    let testInternalOrder = InternalOrder.mockTestInternalOrder();
    
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
        testInternalOrder.customerId = testUser.id;
        testInternalOrder.products = [
            {item: testItem, qty: 10},
            {item: secondTestItem, qty: 10}
            ];
    });
    
    describe("Get Internal Orders", () => {
        beforeEach(async () => {
            const internalOrderId = await internalOrderDao.createInternalOrder(testInternalOrder.issueDate, testInternalOrder.customerId,
                testInternalOrder.state, testInternalOrder.products);
            testInternalOrder.id = internalOrderId;
            console.log(testInternalOrder.id)
        });

        it("Get Internal Orders by Id", async () => {
            const response = await agent.get(`/api/internalOrder/${testInternalOrder.id}`);
           
            response.should.have.status(200);
            
            expect(response.body.id).to.equal(testInternalOrder.id);
            expect(response.body.issueDate).to.equal(testInternalOrder.issueDate);
            expect(response.body.state).to.equal(testInternalOrder.state);
            expect(response.body.customerId).to.equal(testInternalOrder.customerId);
            expect(response.body.skuItems).to.deep.equal([]);

            let products = response.body.products;
            for (let i = 0; i < products.length; i++) {
                expect(products[i].SKUId).to.equal(testRestockOrder.products[i].item.SKUId);
                expect(products[i].description).to.equal(testRestockOrder.products[i].item.description);
                expect(products[i].price).to.equal(testRestockOrder.products[i].item.price);
                expect(products[i].qty).to.equal(testRestockOrder.products[i].qty);
            }
        })
    })

    /*it("Create Restock Order", async () => {
        let restockOrderToSend = {
            issueDate: testRestockOrder.issueDate,
            supplierId: testRestockOrder.supplierId,
            products: testRestockOrder.products.map((p) => ({
                SKUId: p.item.SKUId,
                description: p.item.description,
                price: p.item.price,
                qty: p.qty
            }))
        }

        const response_create = await agent.post(`/api/restockOrder/`).send(restockOrderToSend);
        response_create.should.have.status(201);
    });

    describe("Modify State", () => {
        beforeEach(async () => {
            const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, testRestockOrder.supplierId,
                testRestockOrder.state, testRestockOrder.products);
            testRestockOrder.id = restockOrderId;
        });

        it("Modify State of inexistent Restock Order", async () => {
            const response = await agent.put(`/api/restockOrder/-1`)
                .send({newState: RestockOrder.TESTED});
            response.should.have.status(404);
        })

        it("Modify State of Restock Order", async () => {
            const response = await agent.put(`/api/restockOrder/${testRestockOrder.id}`)
                .send({newState: RestockOrder.TESTED});
            response.should.have.status(200);
        })
    });

    describe("Modify Sku Items list", () => {
        beforeEach(async () => {
            const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, 
                testRestockOrder.supplierId, testRestockOrder.state, testRestockOrder.products);
            testRestockOrder.id = restockOrderId;

            testSkuItem.SKUId = testSku.id;
            secondTestSkuItem.SKUId = secondTestSku.id;

            await skuItemDao.createSKUItem(testSkuItem.RFID, testSkuItem.SKUId, testSkuItem.dateOfStock);
            await skuItemDao.createSKUItem(secondTestSkuItem.RFID, secondTestSkuItem.SKUId, secondTestSkuItem.dateOfStock);

            testRestockOrder.skuItems = [testSkuItem, secondTestSkuItem];
        });

        it("Modify Sku Item list of inexistent Restock Order", async () => {
            const response = await agent.put(`/api/restockOrder/-1/skuItems`)
                .send({
                    skuItems: testRestockOrder.skuItems.map((s) => ({SKUId: s.SKUId, rfid: s.RFID}))
                });
            response.should.have.status(404);
        })

        it("Modify Sku Item list of Restock Order not in DELIVERED state", async () => {
            const response = await agent.put(`/api/restockOrder/${testRestockOrder.id}/skuItems`)
                .send({
                    skuItems: testRestockOrder.skuItems.map((s) => ({SKUId: s.SKUId, rfid: s.RFID}))
                });
            response.should.have.status(422);
        });

        it("Modify Sku Item list with inexistent Sku Items", async () => {
            const response_state = await agent.put(`/api/restockOrder/${testRestockOrder.id}`)
                .send({newState: RestockOrder.DELIVERED});
            response_state.should.have.status(200);

            const response = await agent.put(`/api/restockOrder/${testRestockOrder.id}/skuItems`)
                .send({
                    skuItems: testRestockOrder.skuItems.map(() => ({SKUId: "-1", rfid: "-2"}))
                });
            response.should.have.status(404);
        })

        it("Modify Sku Item list with valid Sku Items", async () => {
            const response_state = await agent.put(`/api/restockOrder/${testRestockOrder.id}`)
                .send({newState: RestockOrder.DELIVERED});
            response_state.should.have.status(200);

            const response = await agent.put(`/api/restockOrder/${testRestockOrder.id}/skuItems`)
                .send({
                    skuItems: testRestockOrder.skuItems.map((s) => ({SKUId: s.SKUId, rfid: s.RFID}))
                });
            response.should.have.status(200);
        })

        afterEach(async () => {
            await skuItemDao.deleteSKUItem(testSkuItem.RFID);
            await skuItemDao.deleteSKUItem(secondTestSkuItem.RFID);
        });
    });

    describe("Modify Transport Note of Restock Order", () => {
        beforeEach(async () => {
            const restockOrderId = await restockOrderDao.createRestockOrder(testRestockOrder.issueDate, 
                testRestockOrder.supplierId, testRestockOrder.state, [
                    {item: testItem, qty: 10},
                    {item: secondTestItem, qty: 10}
                ]);
            testRestockOrder.id = restockOrderId;
        });

        it("Modify Transport Note of inexistent Restock Order", async () => {
            const response = await agent.put(`/api/restockOrder/-1/transportNote`)
                .send({transportNote: {deliveryDate: "2022-02-02"}});
            response.should.have.status(404);
        });
        
        it("Modify Transport Note of Restock Order not in DELIVERY state", async () => {
            const response = await agent.put(`/api/restockOrder/${testRestockOrder.id}/transportNote`)
                .send({transportNote: {deliveryDate: "2022-02-02"}});
            response.should.have.status(422);
        });

        
        it("Modify Transport Note with Delivery Date before Issue Date", async () => {
            const response_state = await agent.put(`/api/restockOrder/${testRestockOrder.id}`)
                .send({newState: RestockOrder.DELIVERY});
            response_state.should.have.status(200);

            const response = await agent.put(`/api/restockOrder/${testRestockOrder.id}/transportNote`)
                .send({transportNote: {deliveryDate: "1980-02-02"}});
            response.should.have.status(422);
        });

        it("Modify with valid Transport Note", async () => {
            const response_state = await agent.put(`/api/restockOrder/${testRestockOrder.id}`)
                .send({newState: RestockOrder.DELIVERY});
            response_state.should.have.status(200);

            const response = await agent.put(`/api/restockOrder/${testRestockOrder.id}/transportNote`)
                .send({transportNote: {deliveryDate: "2222-02-02"}});
            response.should.have.status(200);
        });
    });

    describe("Delete Restock Order", () => {
        it("Delete inexistent Restock Order", async () => {
            const response_state = await agent.delete(`/api/restockOrder/-1`);
            response_state.should.have.status(204);
        });

        it("Delete Restock Order", async () => {
            const response_state = await agent.delete(`/api/restockOrder/${testRestockOrder.id}`);
            response_state.should.have.status(204);

            const response = await agent.get(`/api/restockOrders/${testRestockOrder.id}`);
            response.should.have.status(404);
        });
    });*/

    afterEach(async () => {
        await skuDao.deleteSku(testSku.id);
        await skuDao.deleteSku(secondTestSku.id);
        await userDao.deleteUser(testUser.email, testUser.type);
        await itemDao.deleteItem(testItem.id);
        await itemDao.deleteItem(secondTestItem.id);
        await internalOrderDao.deleteInternalOrder(testInternalOrder.id);
    })
});
