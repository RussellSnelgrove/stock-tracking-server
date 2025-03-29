const _ = require('lodash');

const { asyncHandler } = require('../utils/asyncHandler.js');
const { logger } = require('../utils/logger.js');
const { getStock } = require('../utils/stocksUtils.js');

/**
 * @returns Returns stock details based on the ticker given
 */
const getStockBySymbol = asyncHandler(async (req, res) => {
    const ticker = req.query.ticker;
    if (_.isNil(req.query.ticker)) throw new Error('Ticker is Required!');
    const stockData = await getStock(ticker);
    res.send(stockData);
});

module.exports = { getStockBySymbol };
