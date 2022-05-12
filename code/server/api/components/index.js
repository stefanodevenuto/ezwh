// import { AuthRoutes } from './auth/routes';
var express = require('express');

var SkuRoutes = require('./sku/routes');
var ItemRoutes = require('./item/routes');

function registerApiRoutes(router, prefix = '') {

	// Create all Routes
	const skuRoute = new SkuRoutes();
	const itemRoute = new ItemRoutes();
	
	// Set the Observable-Observe pattern
	if (process.env.ENABLE_MAP === "true") {
		itemRoute.controller.addObserver(skuRoute.controller);	// not correct, just for debug
		skuRoute.controller.addObserver(itemRoute.controller);	// position not defined, so use itemRoute for debugging
	}
	
	// Set all Routes
	router.use(`${prefix}/sku`, skuRoute.router);
	router.use(`${prefix}/skus`, skuRoute.router);
	router.use(`${prefix}/item`, itemRoute.router);
	router.use(`${prefix}/items`, itemRoute.router);
}

module.exports = registerApiRoutes;
