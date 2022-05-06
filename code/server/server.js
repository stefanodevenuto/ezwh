'use strict';
require('dotenv').config();

var express = require('express');
var initRestRoutes = require('./api/routes')

var app = new express();
var port = process.env.PORT || 3002;

initRestRoutes(app);

app.listen(port, function () {
    console.log(`Server listening at http://localhost:${port}: ENABLE_MAP=${process.env.ENABLE_MAP}, EACH_MAP_CAPACITY=${process.env.EACH_MAP_CAPACITY}`);
});

module.exports = app;
