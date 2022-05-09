// import { AuthRoutes } from './auth/routes';
var express = require('express');

var SkuRoutes = require('./sku/routes');
var PositionRoutes = require('./position/routes');
var TestResultRoutes = require('./test_result/routes');

function registerApiRoutes(router, prefix = '') {

	// Create all Routes
	const positionRoute = new PositionRoutes();
	const skuRoute = new SkuRoutes();
	const testResultRoute = new TestResultRoutes();
	
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
	// INSERT HERE (BEFORE TESTRESULT) THE SKUITEM ROUTER
	router.use(`${prefix}/skuitems`, testResultRoute.router);
}

module.exports = registerApiRoutes;