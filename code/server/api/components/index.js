
// import { AuthRoutes } from './auth/routes';
var SkuRoutes = require('./sku/routes');
var express = require('express');

function registerApiRoutes(router, prefix = '') {
	//router.use(`${prefix}/auth`, new AuthRoutes().router);

	// Create all Routes
	const skuRoute = new SkuRoutes();
	
	// Init all Maps
	if (process.env.ENABLE_MAP === "true") {
		const skuReady = skuRoute.initMap();
		// const used = process.memoryUsage().heapUsed / 1024 / 1024;
		// console.log(`Memory used: ${used}MB`)

		// Wait all the Maps to setup
		Promise.all([skuReady]).catch(err => {
			throw err;
		});
	}
	
	router.use(`${prefix}/sku`, skuRoute.router);
	router.use(`${prefix}/skus`, skuRoute.router);
	
}

module.exports = registerApiRoutes;