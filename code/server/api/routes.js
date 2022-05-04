
const express = require('express');
const registerApiRoutes = require('./components/index')
const { registerErrorHandler } = require("./helper")

function initRestRoutes(router) {
	const prefix = '/api';

	router.get(prefix, (req, res) => res.send('It works!'));

	router.use(express.json());

	registerApiRoutes(router, prefix);
	registerErrorHandler(router);
}

module.exports = initRestRoutes;