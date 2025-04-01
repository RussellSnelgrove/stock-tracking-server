const _ = require('lodash');

const { asyncHandler } = require('../utils/asyncHandler.js');
const { getStock, getFormattedData, logMetaData, validateQuery } = require('../utils/stocksUtils.js');

/**
 * @returns Returns stock details based on the ticker given
 */
const getStockBySymbol = asyncHandler(async (req, res) => {
    await validateQuery(req.query);
    const ticker = req.query.ticker?.toUpperCase();
    const stockData = await getStock(ticker, req.query);
    const formattedData = await getFormattedData(stockData[0], ticker);
    // do linear regression then log
    await logMetaData(ticker, stockData[0].meta);
    res.send({ data: formattedData, meta: stockData[0].meta });
    // get 
});

module.exports = { getStockBySymbol };
