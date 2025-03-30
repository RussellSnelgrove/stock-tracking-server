const _ = require('lodash');

const { asyncHandler } = require('../utils/asyncHandler.js');
const { getStock, getFormattedData } = require('../utils/stocksUtils.js');

/**
 * @returns Returns stock details based on the ticker given
 */
const getStockBySymbol = asyncHandler(async (req, res) => {
    const ticker = req.query.ticker?.toUpperCase();
    if (_.isNil(req.query.ticker)) throw new Error('Ticker is Required!');
    const stockData = await getStock(ticker);
    const formattedData = await getFormattedData(stockData[0], ticker);
    res.send({ data: formattedData, meta: stockData[0].meta });
});

module.exports = { getStockBySymbol };
