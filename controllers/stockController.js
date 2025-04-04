const _ = require('lodash');

const { asyncHandler } = require('../utils/asyncHandler.js');
const { getStock, getFormattedData, logMetaData, logStock, validateQuery } = require('../utils/stocksUtils.js');
const { getStockPredictions } = require('../utils/predictivePricingUtils.js');

/**
 * @returns Returns stock details based on the ticker given
 */
const getStockBySymbol = asyncHandler(async (req, res) => {
    await validateQuery(req.query);
    const ticker = req.query.ticker?.toUpperCase();
    const stockData = await getStock(ticker, req.query);
    const formattedData = await getFormattedData(stockData[0], ticker);
    await logMetaData(req.query, stockData[0].meta);
    await logStock(ticker, formattedData);
    res.send({ data: formattedData, metaData: stockData[0].meta });
});

/**
 * @returns Returns predictions based on historical stock data
 */
const getStockPrediction = asyncHandler(async (req, res) => {
    await validateQuery(req.query);
    const ticker = req.query.ticker?.toUpperCase();
    const formattedData = await getFormattedData(ticker);
    const stockPricePredictions = await getStockPredictions(formattedData);
    res.send({ stockPricePredictions });
});
module.exports = { getStockBySymbol };
