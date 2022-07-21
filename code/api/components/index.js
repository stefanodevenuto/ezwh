var SkuRoutes = require('./sku/routes');
var SkuItemRoutes = require('./skuItem/routes');
var PositionRoutes = require('./position/routes');
var TestResultRoutes = require('./test_result/routes');
var TestDescriptorRoutes = require('./test_descriptor/routes');
var UserRoutes = require('./user/routes')
var ItemRoutes = require('./item/routes');
var ReturnOrderRoutes = require('./returnOrder/routes');
var InternalOrderRoutes = require('./internalOrder/routes');
var RestockOrderRoutes = require('./restock_order/routes');

function registerApiRoutes(router, prefix = '') {

	// Create all Routes
	const positionRoute			= new PositionRoutes();
	const skuRoute				= new SkuRoutes();
	const userRoute				= new UserRoutes();
	const skuItemRoute			= new SkuItemRoutes(skuRoute.controller);
	const testResultRoute		= new TestResultRoutes(skuItemRoute.controller);
	const testDescriptorRoute	= new TestDescriptorRoutes();
	const itemRoute				= new ItemRoutes(skuRoute.controller);
	const returnOrderRoute		= new ReturnOrderRoutes(skuItemRoute.controller);
	const internalOrderRoute	= new InternalOrderRoutes(skuRoute.controller);
	const restockOrderRoute		= new RestockOrderRoutes(testResultRoute.controller, 
									skuItemRoute.controller, itemRoute.controller);
	
	
	// Set all Routes
	router.use(`${prefix}/sku`, skuRoute.router);
	router.use(`${prefix}/skus`, skuRoute.router);
	
	router.use(`${prefix}/position`, positionRoute.router);
	router.use(`${prefix}/positions`, positionRoute.router);

	router.use(`${prefix}/skuitem`, skuItemRoute.router);
	router.use(`${prefix}/skuitems`, skuItemRoute.router);

	router.use(`${prefix}/skuitem`, testResultRoute.router);
	router.use(`${prefix}/skuitems`, testResultRoute.router);
	
	router.use(`${prefix}/testDescriptor`, testDescriptorRoute.router);
	router.use(`${prefix}/testDescriptors`, testDescriptorRoute.router);

	router.use(`${prefix}/item`, itemRoute.router);
	router.use(`${prefix}/items`, itemRoute.router);
	
	router.use(`${prefix}/returnOrder`, returnOrderRoute.router);
	router.use(`${prefix}/returnOrders`, returnOrderRoute.router);
	
	router.use(`${prefix}/`, internalOrderRoute.router);
	router.use(`${prefix}/`, userRoute.router);
	router.use(`${prefix}/`, restockOrderRoute.router);
}

module.exports = registerApiRoutes;
