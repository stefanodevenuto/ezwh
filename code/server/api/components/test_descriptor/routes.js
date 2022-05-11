const express = require('express');
const { param, body } = require("express-validator")
const TestDescriptorController = require('./controller');
const { ErrorHandler } = require("../../helper");

class TestDescriptorRoutes {
    constructor() {
        this.ErrorHandler = new ErrorHandler();
        this.name = 'testDescriptor';
        this.controller = new TestDescriptorController();
        this.router = express.Router();
        this.initRoutes();
    }

    initRoutes() {
        this.router.get();
        this.router.post();
        this.router.put();
        this.router.delete();
    }
}

module.exports = TestDescriptorRoutes;
