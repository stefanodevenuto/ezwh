// import { AuthRoutes } from './auth/routes';
var express = require('express');

var SkuRoutes = require('./sku/routes');
var SkuItemRoutes = require('./skuItem/routes');
var PositionRoutes = require('./position/routes');
var TestResultRoutes = require('./test_result/routes');
var TestDescriptorRoutes = require('./test_descriptor/routes');
var UserRoutes = require('./user/routes')

function registerApiRoutes(router, prefix = '') {

	// Create all Routes
	const positionRoute = new PositionRoutes();
	const skuRoute = new SkuRoutes();
	const userRoute = new UserRoutes();
	const skuItemRoute = new SkuItemRoutes();
	const testResultRoute = new TestResultRoutes();
	const testDescriptorRoute = new TestDescriptorRoutes();
	
	// Set the Observable-Observe pattern
	if (process.env.ENABLE_MAP === "true") {
		positionRoute.controller.addObserver(skuRoute.controller);
		skuRoute.controller.addObserver(positionRoute.controller);
		testDescriptorRoute.controller.addObserver(skuRoute.controller);
		testDescriptorRoute.controller.addObserver(testResultRoute.controller);
		skuItemRoute.controller.addObserver(skuItemRoute.controller);
		userRoute.controller.addObserver(userRoute.controller);
	}
	
	// Set all Routes
	router.use(`${prefix}/sku`, skuRoute.router);
	router.use(`${prefix}/skus`, skuRoute.router);
	
	router.use(`${prefix}/position`, positionRoute.router);
	router.use(`${prefix}/positions`, positionRoute.router);

	router.use(`${prefix}/skuitem`, skuItemRoute.router);
	router.use(`${prefix}/skuitems`, skuItemRoute.router);
	router.use(`${prefix}/skuitems`, testResultRoute.router);
	
	router.use(`${prefix}/testDescriptor`, testDescriptorRoute.router);
	router.use(`${prefix}/testDescriptors`, testDescriptorRoute.router);

	router.use(`${prefix}/`, userRoute.router);
	
}

module.exports = registerApiRoutes;