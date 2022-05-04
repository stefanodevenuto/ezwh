
// import { AuthRoutes } from './auth/routes';
var SkuRoutes = require('./sku/routes');

function registerApiRoutes(router, prefix = '') {
	//router.use(`${prefix}/auth`, new AuthRoutes().router);

	// Create all Routes
	const skuRoute = new SkuRoutes();
	
	// Init all Maps
	const skuReady = skuRoute.initMap();

	// Wait all the Maps to setup
	Promise.all([skuReady]).catch(err => {
		throw err;
	});

	router.use(`${prefix}/sku`, skuRoute.router);
	router.use(`${prefix}/skus`, skuRoute.router);
	
}

module.exports = registerApiRoutes;