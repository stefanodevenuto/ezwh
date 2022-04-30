'use strict';

const express = require('express');

const app = new express();
const port = 3002;

var skuManager = require('./managers/skuManager');

app.use(express.json());

app.get('/', (req,res) => res.status(404).send('Page not found!') );
app.get('/api/', (req,res) => res.status(404).send('Page not found!') );
app.use('/api/skus/', skuManager);

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;