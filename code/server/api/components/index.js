// import { AuthRoutes } from './auth/routes';
var express = require('express');

var SkuRoutes = require('./sku/routes');
var SkuItemRoutes = require('./skuItem/routes');
var PositionRoutes = require('./position/routes');
var TestResultRoutes = require('./test_result/routes');
var TestDescriptorRoutes = require('./test_descriptor/routes');
var UserRoutes = require('./user/routes')
var ItemRoutes = require('./item/routes');
var RestockOrderRoutes = require('./restock_order/routes');

function registerApiRoutes(router, prefix = '') {

	// Create all Routes
	const positionRoute = new PositionRoutes();
	const skuRoute = new SkuRoutes();
	const userRoute = new UserRoutes();
	const skuItemRoute = new SkuItemRoutes();
	const testResultRoute = new TestResultRoutes(skuItemRoute.controller);
	const testDescriptorRoute = new TestDescriptorRoutes();
	const itemRoute = new ItemRoutes();
	const restockOrderRoute = new RestockOrderRoutes(testResultRoute.controller, 
		skuItemRoute.controller, itemRoute.controller);
	
	// Set the Observable-Observe pattern
	if (process.env.ENABLE_MAP === "true") {
		positionRoute.controller.addObserver(skuRoute.controller);
		skuRoute.controller.addObserver(positionRoute.controller);
		testDescriptorRoute.controller.addObserver(skuRoute.controller);
		testDescriptorRoute.controller.addObserver(testResultRoute.controller);
		skuItemRoute.controller.addObserver(testResultRoute.controller);
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

	router.use(`${prefix}/item`, itemRoute.router);
	router.use(`${prefix}/items`, itemRoute.router);

	router.use(`${prefix}/`, userRoute.router);
	router.use(`${prefix}/restockOrder`, restockOrderRoute.router);
	router.use(`${prefix}/restockOrders`, restockOrderRoute.router);

	router.use(`${prefix}/`, restockOrderRoute.router);
}

module.exports = registerApiRoutes;
