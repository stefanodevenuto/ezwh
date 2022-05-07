// import { AuthRoutes } from './auth/routes';
var express = require('express');

var SkuRoutes = require('./sku/routes');
var PositionRoutes = require('./position/routes');

function registerApiRoutes(router, prefix = '') {
	//router.use(`${prefix}/auth`, new AuthRoutes().router);

	// Create all Routes
	const skuRoute = new SkuRoutes();
	const positionRoute = new PositionRoutes();
	
	// Init all Maps
	if (process.env.ENABLE_MAP === "true") {
		const skuReady = skuRoute.initMap();
		const positionReady = positionRoute.initMap();
		// const used = process.memoryUsage().heapUsed / 1024 / 1024;
		// console.log(`Memory used: ${used}MB`)

		// Wait all the Maps to setup
		Promise.all([skuReady, positionReady]).catch(err => {
			throw err;
		});
	}
	
	// Set all Routes
	router.use(`${prefix}/sku`, skuRoute.router);
	router.use(`${prefix}/skus`, skuRoute.router);
	router.use(`${prefix}/position`, positionRoute.router);
	router.use(`${prefix}/positions`, positionRoute.router);
	
}

module.exports = registerApiRoutes;