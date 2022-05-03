//import { Sku } from './sku';

var sqlite3 = require("sqlite3");
var AppDAO = require("../../../db/AppDAO");

class SkuDAO extends AppDAO{

    constructor() {
        super();
    }
    
    async getAllSkus() {
        const query = 'SELECT * FROM sku';
        return await this.all(query);
    }

    async getSkuByID(skuId) {
        const query = 'SELECT * FROM sku WHERE id = ?';
        let row = await this.get(query, [skuId]);

        return row;
    }
}

module.exports = SkuDAO;
