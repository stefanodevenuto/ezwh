
//import { registerErrorHandler, registerMiddleware } from './middleware';

var express = require('express');
var registerApiRoutes = require('./components/index')

function initRestRoutes(router) {
	const prefix = '/api';

	router.get(prefix, (req, res) => res.send('It works!'));

	router.use(express.json());
	registerApiRoutes(router, prefix);
}

module.exports = initRestRoutes;