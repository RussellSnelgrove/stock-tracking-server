const express = require('express');
const { getStockData, getStockPrediction, queryStockData } = require('../controllers/stockController.js');

const stockRoutes = express.Router();

stockRoutes.get('/get-data', getStockData);
stockRoutes.get('/predict', getStockPrediction);
stockRoutes.get('/query-stock-data', queryStockData);

module.exports = stockRoutes;