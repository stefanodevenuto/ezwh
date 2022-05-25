const InternalOrderDAO = require('../api/components/internalOrder/dao');
const SkuDAO = require('../api/components/sku/dao');
const UserDAO = require('../api/components/user/dao');
const SKUItemDAO = require('../api/components/skuItem/dao');

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
    const internalOrderDao = new InternalOrderDAO();
    const skuDao = new SkuDAO();
    const userDao = new UserDAO();
    const skuItemDao = new SKUItemDAO();

    let testUser = User.mockUserCustomer();
    let testSku = Sku.mockTestSku();
    let secondTestSku = Sku.mockTestSku();

    let testItem = Item.mockItem();
    let secondTestItem = Item.mockItem();
    secondTestItem.id = testItem.id + 1;

    let testSkuItem = SKUItem.mockTestSkuItem();
    let secondTestSkuItem = SKUItem.mockTestSkuItem();
    secondTestSkuItem.RFID = testSkuItem.RFID.replace(/.$/, "2")

    let testInternalOrder = InternalOrder.mockTestInternalOrder();

    before(async () => {
        await internalOrderDao.deleteAllInternalOrder();
        await skuDao.deleteAllSKU();
        await userDao.deleteAllUser();
        await skuItemDao.deleteAllSKUItem();
    });

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
    });

    describe("Get Internal Orders", () => {
        beforeEach(async () => {
            const internalOrderId = await internalOrderDao.createInternalOrder(testInternalOrder.issueDate,
                testInternalOrder.customerId, testInternalOrder.state, testInternalOrder.products);
            testInternalOrder.id = internalOrderId;
        });

        it("Get Internal Order by Id", async () => {
            const response = await agent.get(`/api/internalOrders/${testInternalOrder.id}`);
            response.should.have.status(200);

            expect(response.body.id).to.equal(testInternalOrder.id);
            expect(response.body.issueDate).to.equal(testInternalOrder.issueDate);
            expect(response.body.state).to.equal(testInternalOrder.state);
            expect(response.body.customerId).to.equal(testInternalOrder.customerId);

            let products = response.body.products;
            for (let i = 0; i < products.length; i++) {
                expect(products[i].SKUId).to.equal(testInternalOrder.products[i].SKUId);
                expect(products[i].description).to.equal(testInternalOrder.products[i].description);
                expect(products[i].price).to.equal(testInternalOrder.products[i].price);
                expect(products[i].qty).to.equal(testInternalOrder.products[i].qty);
            }
        })

        afterEach(async () => {
            await internalOrderDao.deleteInternalOrder(testInternalOrder.id);
        });
    })

    it("Create Internal Order", async () => {
        let internalOrderToSend = {
            issueDate: testInternalOrder.issueDate,
            customerId: testInternalOrder.customerId,
            products: testInternalOrder.products
        }

        const response_create = await agent.post(`/api/internalOrders/`).send(internalOrderToSend);
        response_create.should.have.status(201);
    });

    describe("Modify State", () => {
        beforeEach(async () => {
            const internalOrderId = await internalOrderDao.createInternalOrder(testInternalOrder.issueDate, 
                testInternalOrder.customerId, testInternalOrder.state, testInternalOrder.products);
            testInternalOrder.id = internalOrderId;

            await skuItemDao.createSKUItem(testSkuItem.RFID, testSku.id, testSkuItem.dateOfStock);
            await skuItemDao.createSKUItem(secondTestSkuItem.RFID, secondTestSku.id, secondTestSkuItem.dateOfStock);
            
            testSkuItem.SKUId = testSku.id;
            secondTestSkuItem.SKUId = secondTestSku.id;

            testInternalOrder.products = [
                { SkuID: testSkuItem.SKUId, description: testSku.description, 
                    price: testSku.price, RFID: testSkuItem.RFID },
                { SkuID: secondTestSkuItem.SKUId, description: secondTestSku.description, 
                    price: secondTestSku.price, RFID: secondTestSkuItem.RFID },
            ];
        });

        it("Modify State of inexistent Internal Order", async () => {
            const response = await agent.put(`/api/internalOrders/-1`)
                .send({ newState: InternalOrder.ACCEPTED});
            response.should.have.status(404);
        })

        it("Modify State (COMPLETED) of inexistent Internal Order", async () => {
            const response = await agent.put(`/api/internalOrders/-1`)
                .send({ newState: InternalOrder.COMPLETED, products: testInternalOrder.products});
            response.should.have.status(404);
        })

        it("Modify State of Internal Order", async () => {
            const response = await agent.put(`/api/internalOrders/${testInternalOrder.id}`)
                .send({ newState: InternalOrder.ACCEPTED });
            response.should.have.status(200);
        })
        
        it("Modify State (COMPLETED) of Internal Order", async () => {
            const response = await agent.put(`/api/internalOrders/${testInternalOrder.id}`)
                .send({ newState: InternalOrder.COMPLETED, products: testInternalOrder.products});
            response.should.have.status(200);
        })

        afterEach(async () => {
           await internalOrderDao.deleteInternalOrder(testInternalOrder.id);
           await skuItemDao.deleteAllSKUItem();
        })
    });

    describe("Delete Restock Order", () => {
        it("Delete inexistent Restock Order", async () => {
            const response_state = await agent.delete(`/api/internalOrders/-1`);
            response_state.should.have.status(204);
        });

        it("Delete Restock Order", async () => {
            const response_state = await agent.delete(`/api/internalOrders/${testInternalOrder.id}`);
            response_state.should.have.status(204);
        });
    });

    afterEach(async () => {
        await skuDao.deleteSku(testSku.id);
        await skuDao.deleteSku(secondTestSku.id);
        await userDao.deleteUser(testUser.email, testUser.type);
        await internalOrderDao.deleteAllInternalOrder();
    })
});
