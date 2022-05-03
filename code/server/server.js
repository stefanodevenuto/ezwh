'use strict';

var express = require('express');
var initRestRoutes = require('./api/routes')

var app = new express();
var port = 3002;

initRestRoutes(app);


app.listen(port, function () {
    console.log("Server listening at http://localhost:".concat(port));
});

module.exports = app;
