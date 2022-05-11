// import { AuthRoutes } from './auth/routes';
var express = require('express');

var SkuRoutes = require('./sku/routes');
var PositionRoutes = require('./position/routes');

function registerApiRoutes(router, prefix = '') {

	// Create all Routes
	const positionRoute = new PositionRoutes();
	const skuRoute = new SkuRoutes();
	
	// Set the Observable-Observe pattern
	if (process.env.ENABLE_MAP === "true") {
		positionRoute.controller.addObserver(skuRoute.controller);
		skuRoute.controller.addObserver(positionRoute.controller);
	}
	
	// Set all Routes
	router.use(`${prefix}/sku`, skuRoute.router);
	router.use(`${prefix}/skus`, skuRoute.router);
	router.use(`${prefix}/position`, positionRoute.router);
	router.use(`${prefix}/positions`, positionRoute.router);
	
}

module.exports = registerApiRoutes;