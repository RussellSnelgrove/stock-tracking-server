const _ = require('lodash');

const { asyncHandler } = require('../utils/asyncHandler.js');
const { getStock, getFormattedData, logMetaData, validateQuery } = require('../utils/stocksUtils.js');
const { getStockPredictions } = require('../utils/predictivePricingUtils.js');

/**
 * @returns Returns stock details based on the ticker given
 */
const getStockBySymbol = asyncHandler(async (req, res) => {
    await validateQuery(req.query);
    const ticker = req.query.ticker?.toUpperCase();
    const stockData = await getStock(ticker, req.query);
    const formattedData = await getFormattedData(stockData[0], ticker);
    const stockPricePredictions = await getStockPredictions(formattedData);
    const metaData = { ...stockData[0].meta, ...stockPricePredictions };
    await logMetaData(ticker, metaData);
    res.send({ data: formattedData, metaData });
});

module.exports = { getStockBySymbol };
