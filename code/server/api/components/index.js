// import { AuthRoutes } from './auth/routes';
var express = require('express');

var SkuRoutes = require('./sku/routes');
var SkuItemRoutes = require('./skuItem/routes');
var PositionRoutes = require('./position/routes');
var TestResultRoutes = require('./test_result/routes');

function registerApiRoutes(router, prefix = '') {

	// Create all Routes
	const positionRoute = new PositionRoutes();
	const skuRoute = new SkuRoutes();
	const skuItemRoute = new SkuItemRoutes();
	const testResultRoute = new TestResultRoutes();
	
	// Set the Observable-Observe pattern
	if (process.env.ENABLE_MAP === "true") {
		positionRoute.controller.addObserver(skuRoute.controller);
		skuRoute.controller.addObserver(positionRoute.controller);
		skuItemRoute.controller.addObserver(skuItemRoute.controller);
	}
	
	// Set all Routes
	router.use(`${prefix}/sku`, skuRoute.router);
	router.use(`${prefix}/skus`, skuRoute.router);
	router.use(`${prefix}/position`, positionRoute.router);
	router.use(`${prefix}/positions`, positionRoute.router);
	router.use(`${prefix}/skuitem`, skuItemRoute.router);
	router.use(`${prefix}/skuitems`, skuItemRoute.router);
	router.use(`${prefix}/skuitems`, testResultRoute.router);
}

module.exports = registerApiRoutes;