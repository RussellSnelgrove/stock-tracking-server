const express = require('express');
const { getStockBySymbol } = require('../controllers/stockController.js');

const stockRoutes = express.Router();

stockRoutes.get('/symbol', getStockBySymbol);
// stockRoutes.get('/', getAllStocksStoredLocally);

module.exports = stockRoutes;