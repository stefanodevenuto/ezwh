const ReturnOrderDAO = require('./dao')
const ReturnOrder = require("./returnOrder");
const SkuDAO = require('../sku/dao');
const SkuController = require('../sku/controller')
const Products = require('./products');
const { ReturnOrderErrorFactory } = require('./error');
const Cache = require('lru-cache')

class ReturnOrderController {
    constructor() {
        this.dao = new ReturnOrderDAO();
        this.sku = new SkuDAO();
        this.SkuController = new SkuController();
        this.returnOrderMap = new Cache({ max: Number(process.env.EACH_MAP_CAPACITY) });
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

    async buildReturnOrders(rows){
        let last = -1;
        let p = [];
        let output = [];
        let prod = [];
        
        if(rows.id === undefined){
            rows.map((ret) => {
                rows.map((pr) => {
                    p.push(new Products(pr.SKUId, pr.description,
                            pr.price, pr.RFID));  
                })

                    prod = p;

                    if((output.find(a => a.id === ret.id) === undefined || output.length === 0)){
                        output.push(new ReturnOrder(ret.id, ret.returnDate, prod, ret.restockOrderId));
                    }
            p = [];
            
            });
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
                        output.push(new ReturnOrder(ret.id, ret.returnDate, prod, ret.restockOrderId));
                    }

                p = [];
                
            });
        }
    
        return output;
    }

    // ################################ API
    async getAllReturnOrders(req, res, next) {
        try {
            const rows = await this.dao.getAllReturnOrders();
           /* const positions = rows.map(record => new Position(record.positionID, record.aisleID, record.row,
                record.col, record.maxWeight, record.maxVolume, record.occupiedWeight, record.occupiedVolume, record.skuId));*/
            
            const output = await this.buildReturnOrders(rows);

            return res.status(200).json(output);
        } catch (err) {
            return next(err);
        }
    }

    async getReturnOrderByID(req, res, next) {
        try {
            const returnOrderID = req.params.id;

            /*if (this.enableCache) {
                const position = this.positionMap.get(positionID);

                if (position !== undefined)
                    return res.status(200).json(position);
            }*/
    
            const rows = await this.dao.getReturnOrderByID(returnOrderID);

            const output = await this.buildReturnOrders(rows);

            if (rows === undefined)
                throw PositionErrorFactory.newPositionNotFound();
    
                /*const position = new Position(row.positionID, row.aisleID, row.row,
                row.col, row.maxWeight, row.maxVolume, row.occupiedWeight, row.occupiedVolume)
    
            if (this.enableCache)
                this.positionMap.set(position.positionID, position)*/

            return res.status(200).json(output);
        } catch (err) {
            return next(err);
        }
    }


    async createReturnOrder(req, res, next) {
        try {
            const rawReturnOrder = req.body;

           // if (rawPosition.positionID !== `${rawPosition.aisleID}${rawPosition.row}${rawPosition.col}`)
             //   throw PositionErrorFactory.newPositionIdNotSymmetric();
            let rawProducts = req.body.products;
            rawProducts = rawProducts.map(record => new Products(record.SKUId, record.description,
                record.price, record.RFID));

              /*  let userToken = AuthUser(data)
                console.log(userToken) // Promise { <pending> }
                
                userToken.then(function(result) {
                   console.log(result) // "Some User token"
                }*/
            
            for(let row of rawProducts){
               console.log(row.SKUId);
               let id = await this.sku.getSkuByID(row.SKUId);
               console.log(id);
               if(id === undefined){
                   return res.status(404).send();
               }
            }
            //console.log(this.sku.getSkuByID(req.body.products.SKUId));
            

            await this.dao.createReturnOrder(rawReturnOrder);

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

    async deleteReturnOrder(req, res, next) {
        try {
            const returnOrderID = req.params.id;
            const { changes } = await this.dao.deleteReturnOrder(returnOrderID);

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

module.exports = ReturnOrderController;