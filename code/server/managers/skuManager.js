var express = require('express');
var router = express.Router();
var SKU = require('../classes/SKU');

let skus = new Map();

let sku = new SKU("un bello SKU", 10, 10, "fragile", 12345, 20, 10.50, [1, 2, 3])
sku.id = 1;
skus.set(sku.id, sku);

/* Get all SKUs. */
router.get('/', function(req, res, next) {
    let array_skus = Array.from(skus.values());
    res.json(array_skus);
});

module.exports = router;