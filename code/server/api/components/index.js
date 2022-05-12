// import { AuthRoutes } from './auth/routes';
var express = require('express');

var SkuRoutes = require('./sku/routes');
var PositionRoutes = require('./position/routes');
var TestResultRoutes = require('./test_result/routes');
var TestDescriptorRoutes = require('./test_descriptor/routes');

function registerApiRoutes(router, prefix = '') {

	// Create all Routes
	const positionRoute = new PositionRoutes();
	const skuRoute = new SkuRoutes();
	const testResultRoute = new TestResultRoutes();
	const testDescriptorRoute = new TestDescriptorRoutes();
	
	// Set the Observable-Observe pattern
	if (process.env.ENABLE_MAP === "true") {
		positionRoute.controller.addObserver(skuRoute.controller);
		skuRoute.controller.addObserver(positionRoute.controller);
		testDescriptorRoute.controller.addObserver(skuRoute.controller);
		testDescriptorRoute.controller.addObserver(testResultRoute.controller);
	}
	
	// Set all Routes
	router.use(`${prefix}/sku`, skuRoute.router);
	router.use(`${prefix}/skus`, skuRoute.router);
	router.use(`${prefix}/position`, positionRoute.router);
	router.use(`${prefix}/positions`, positionRoute.router);
	// INSERT HERE (BEFORE TESTRESULT) THE SKUITEM ROUTER
	router.use(`${prefix}/skuitems`, testResultRoute.router);
	router.use(`${prefix}/testDescriptor`, testDescriptorRoute.router);
	router.use(`${prefix}/testDescriptors`, testDescriptorRoute.router);
}

module.exports = registerApiRoutes;