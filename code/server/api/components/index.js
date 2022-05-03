
// import { AuthRoutes } from './auth/routes';
var SkuRoutes = require('./sku/routes');

function registerApiRoutes(router, prefix = '') {
	//router.use(`${prefix}/auth`, new AuthRoutes().router);

	let skuRouter = new SkuRoutes().router;
	
	router.use(`${prefix}/sku`, skuRouter);
	router.use(`${prefix}/skus`, skuRouter);
}

module.exports = registerApiRoutes;