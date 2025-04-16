const _ = require('lodash');

const { asyncHandler } = require('../utils/asyncHandler.js');
const { getStock, getFormattedData, logMetaData, logStock, validateQuery, queryData, queryStockPriceData } = require('../utils/stocksUtils.js');
const { getStockPredictions } = require('../utils/predictivePricingUtils.js');

/**
 * @returns Returns stock details based on the symbol given
 */
const getStockData = asyncHandler(async (req, res) => {
    await validateQuery(req.query);
    const symbol = req.query.symbol?.toUpperCase();
    const stockData = await getStock(symbol, req.query);
    const formattedData = await getFormattedData(stockData[0], symbol);
    await logMetaData(req.query, stockData[0].meta);
    await logStock(symbol, formattedData);
    res.send({ data: formattedData, metaData: stockData[0].meta });
});

/**
 * @returns Returns predictions based on historical stock data
 */
const getStockPrediction = asyncHandler(async (req, res) => {
    await validateQuery(req.query);
    const data = await queryStockPriceData(req.query);
    const stockPricePredictions = await getStockPredictions(data);
    res.send(data);
});

/**
 * @returns Returns all stored rows of a symbol
 */
const queryStockData = asyncHandler(async (req, res) => {
    await validateQuery(req.query);
    const data = await queryData(req.query);
    // const formattedData = await getFormattedData(symbol);
    // const stockPricePredictions = await getStockPredictions(formattedData);
    res.send({ data });
});

module.exports = { getStockData, getStockPrediction, queryStockData };
