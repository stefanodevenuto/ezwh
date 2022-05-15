const InternalOrderDAO = require('./dao')
const InternalOrder = require("./internalOrder");
const SkuDAO = require('../sku/dao');
const SkuController = require('../sku/controller')
const Products = require('./products');
const ProductsQ = require('./productsQ.js');
const { InternalOrderErrorFactory } = require('./error');
const Cache = require('lru-cache')

class InternalOrderController {
    constructor() {
        this.dao = new InternalOrderDAO();
        this.sku = new SkuDAO();
        this.SkuController = new SkuController();
        this.InternalOrderMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
        this.enableCache = (process.env.ENABLE_MAP === "true") || false;
        this.allInCache = false;
        this.observers = [];
    }

    // ################################ Observer-Observable Pattern
    addObserver(observer) {
        this.observers.push(observer);
    }

    notify(data) {
        if (this.observers.length > 0) {
            this.observers.forEach(observer => observer.update(data));
        }
    }

    /*update(data) {
		const { action, value: sku } = data;
        switch(action) {
            case "UPDATE_QUANTITY": {
                let position = this.positionMap.get(sku.positionId);
                if (position !== undefined) {
                    position.occupiedWeight = sku.availableQuantity * sku.weight;
                    position.occupiedVolume = sku.availableQuantity * sku.volume;
                }
            }
            break;

            case "UPDATE_SKU_ID": {
                let position = this.positionMap.get(newPosition);
                if (position !== undefined)
				    position.skuId = sku.id;
            }
            break;
        }
	}*/

    async buildInternalOrders(rows){
        let last = -1;
        let p = [];
        let output = [];
        let prod = [];
        // Possible impletentation:
        // Use classes products from folder of return and restock Order
        // in this way we can use the different constructor to create
        // the object to push in the array of the and then in the array of the
        // output 
        

        
                rows.map((ret) => {
                    if(ret.state !== "COMPLETED"){
                        if(ret.id !== last){
                            last = ret.id; 
                        }

                        rows.map((pr) => {
                            if(last === pr.id){
                                p.push(new ProductsQ(pr.SKUId, pr.description,
                                    pr.price, pr.qty));  
                            }
                        })

                            prod = p;

                        if((output.find(a => a.id === ret.id) === undefined || output.length === 0)){
                            output.push(new InternalOrder(ret.id, ret.issueDate, ret.state, prod, ret.customerId));
                        }

                    p = [];
                    
                } else {
                    rows.map((ret) => {
                             if(ret.id !== last){
                                 last = ret.id; 
                             }
     
                             rows.map((pr) => {
                                 if(last === pr.id){
                                     p.push(new Products(pr.SKUId, pr.description,
                                         pr.price, pr.RFID));  
                                 }
                             })
     
                                 prod = p;
     
                             if((output.find(a => a.id === ret.id) === undefined || output.length === 0)){
                                 output.push(new InternalOrder(ret.id, ret.issueDate, ret.state, prod, ret.customerId));
                             }
     
                         p = [];
                         
                     });
     
             }
            });
    
        return output;
    }

    
    async buildRestockOrders(rows) {
        let internalOrders = [];
        let product;
        if (rows.length > 0) {
            // Setup last as the first restockOrder
            let lastInternalOrder = rows[0];

            let products = [];
            
            for (let row of rows) {
                // If it's the same restockOrder, continue adding the related Skus
                if (row.id == lastInternalOrder.id) {
                    if(row.state !== "COMPLETED"){
                    //let item = new Item(row.SKUId, row.description, row.price);
                        product = new ProductsQ(row.SKUId, row.description, row.price, row.qty);
                    } else {
                        product = new Products(row.SKUId, row.description, row.price, row.RFID);
                    }
                    products.push(product);
                } else {
                    // Otherwise, create the current restockOrder and clear the products array
                    const internalOrder = new InternalOrder(lastInternalOrder.id, lastInternalOrder.issueDate, lastInternalOrder.state, products, lastInternalOrder.customerId);

                    //InternalOrder.skuItems = await this.skuItemController.getAllSkuItemsByRestockOrderAndCache(InternalOrder.id);
                    internalOrders.push(internalOrder);

                    // Reset
                    lastInternalOrder = row;
                    products = [];

                    // Don't lose the current Item!
                    if(row.state !== "COMPLETED"){
                        //let item = new Item(row.SKUId, row.description, row.price);
                            product = new ProductsQ(row.SKUId, row.description, row.price, row.qty);
                        } else {
                            product = new Products(row.SKUId, row.description, row.price, row.RFID);
                        }
                    products.push(product);
                }
            }

            // Create the last restockOrder
            const internalOrder = new InternalOrder(lastInternalOrder.id, lastInternalOrder.issueDate, lastInternalOrder.state, products, lastInternalOrder.customerId);

            //InternalOrder.skuItems = await this.skuItemController.getAllSkuItemsByRestockOrderAndCache(restockOrder.id);
            internalOrders.push(internalOrder);
        }

        return internalOrders;
    }

    async getInternalOrderByIDInternal(internalOrderId) {
        if (this.enableCache) {
            const internalOrder = this.InternalOrderMap.get(internalOrderId);

            if (internalOrder !== undefined)
                return internalOrder;
        }

        const rows = await this.dao.getInternalOrderByID(internalOrderId);
        if (rows.length === 0)
            throw InternalOrderErrorFactory.newRestockOrderNotFound();

        const [internalOrder] = await this.buildInternalOrders(rows);

        if (this.enableCache)
            this.InternalOrderMap.set(internalOrder.id, internalOrder)

        return internalOrder;
    }


    // ################################ API
    async getAllInternalOrders(req, res, next) {
        try {
            const rows = await this.dao.getAllInternalOrders();
           /* const positions = rows.map(record => new Position(record.positionID, record.aisleID, record.row,
                record.col, record.maxWeight, record.maxVolume, record.occupiedWeight, record.occupiedVolume, record.skuId));*/
            
            console.log(rows);

            const output = await this.buildInternalOrders(rows);
            const output1 = await this.buildRestockOrders(rows);
            return res.status(200).json(output1);
        } catch (err) {
            return next(err);
        }
    }

    async getInternalOrdersIssued(req, res, next) {
        try {
            const rows = await this.dao.getInternalOrdersIssued();
           /* const positions = rows.map(record => new Position(record.positionID, record.aisleID, record.row,
                record.col, record.maxWeight, record.maxVolume, record.occupiedWeight, record.occupiedVolume, record.skuId));*/
            
            console.log(rows);

            const output = await this.buildInternalOrders(rows);
            const output1 = await this.buildRestockOrders(rows);

            return res.status(200).json(output1);
        } catch (err) {
            return next(err);
        }
    }

    async getInternalOrdersAccepted(req, res, next) {
        try {
            const rows = await this.dao.getInternalOrdersAccepted();
           /* const positions = rows.map(record => new Position(record.positionID, record.aisleID, record.row,
                record.col, record.maxWeight, record.maxVolume, record.occupiedWeight, record.occupiedVolume, record.skuId));*/
            
            console.log(rows);

            const output = await this.buildInternalOrders(rows);
            const output1 = await this.buildRestockOrders(rows);

            return res.status(200).json(output1);
        } catch (err) {
            return next(err);
        }
    }

    async getInternalOrderByID(req, res, next) {
        try {
            const internalOrderID = Number(req.params.id);

            /*if (this.enableCache) {
                const position = this.positionMap.get(positionID);

                if (position !== undefined)
                    return res.status(200).json(position);
            }*/
    
            let internalOrder = await this.getInternalOrderByIDInternal(internalOrderID);

            if (internalOrder === undefined)
                throw PositionErrorFactory.newPositionNotFound();
    
                /*const position = new Position(row.positionID, row.aisleID, row.row,
                row.col, row.maxWeight, row.maxVolume, row.occupiedWeight, row.occupiedVolume)
    
            if (this.enableCache)
                this.positionMap.set(position.positionID, position)*/

            return res.status(200).json(internalOrder);
        } catch (err) {
            return next(err);
        }
    }


    async createInternalOrder(req, res, next) {
        try {
            const rawInternalOrder = req.body;

           // if (rawPosition.positionID !== `${rawPosition.aisleID}${rawPosition.row}${rawPosition.col}`)
             //   throw PositionErrorFactory.newPositionIdNotSymmetric();
            let rawProducts = req.body.products;
            rawProducts = rawProducts.map(record => new ProductsQ(record.SKUId, record.description,
                record.price, record.qty));

              /*  let userToken = AuthUser(data)
                console.log(userToken) // Promise { <pending> }
                
                userToken.then(function(result) {
                   console.log(result) // "Some User token"
                }*/
            
            for(let row of rawProducts){
               let sku = await this.sku.getSkuByID(row.SKUId);
               if(sku === -1){
                   return res.status(404).send();
               }
            }
            //console.log(this.sku.getSkuByID(req.body.products.SKUId));
            

            await this.dao.createInternalnOrder(rawInternalOrder, rawProducts);

            /*if (this.enableCache) {
                const position = new Position(rawPosition.positionID, rawPosition.aisleID, rawPosition.row,
                    rawPosition.col, rawPosition.maxWeight, rawPosition.maxVolume, rawPosition.occupiedWeight, rawPosition.occupiedVolume)

                this.positionMap.set(position.positionID, position);
            }*/

            return res.status(201).send();
        } catch (err) {
            return next(err);
        }
    }

    


    async modifyStateInternalOrder(req, res, next) {
        try {
            const internalOrderId = req.params.id;
            const rawInternalOrder = req.body;
           

            const { changes } = await this.dao.modifyStateInternalOrder(internalOrderId, rawInternalOrder);

          
            return res.status(200).send();
        } catch (err) {
            
            return next(err);
        }
    }

    async deleteInternalOrder(req, res, next) {
        try {
            const internalOrderID = req.params.id;
            const { changes } = await this.dao.deleteInternalOrder(internalOrderID);

            /*if (changes === 0)
                throw PositionErrorFactory.newPositionNotFound();

            if (this.enableCache) {
                let position = this.positionMap.get(positionID);
                this.positionMap.delete(positionID);
                this.notify({action: "DELETE", value: position});
            }*/

            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = InternalOrderController;