const _ = require('lodash');
const fs = require('fs').promises;
const Joi = require('joi');

const config = require('../config/config.js');
const { logger } = require('./logger.js')
const { insertUpdateDatabase } = require('./dbConnectionUtils.js');

const schema = Joi.object({
    ticker: Joi.string().pattern(/^[A-Z0-9]{1,5}(\.[A-Z]{1,5})?$/).required(),
    start: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

const validateQuery = async (query) => {
    await schema.validateAsync(query);
    // add valid date check
}

const getUrl = async (symbol, opts) => {
    const {
        urlBase = config.stockEndpoint.urlBase,
        start = config.stockEndpoint.start,
        end = config.stockEndpoint.end,
        interval = config.stockEndpoint.interval,
        includePrePost = config.stockEndpoint.includePrePost,
        events = config.stockEndpoint.events,
        lang = config.stockEndpoint.lang
    } = opts;

    const period1 = new Date(start).getTime();
    const period2 = new Date(end).getTime();

    const url = `${urlBase}/${symbol}?period1=${period1 / 1000}&period2=${period2 / 1000}&interval=${interval}&includePrePost=${includePrePost}&events=${events}&lang=${lang}&region=CA`
    return url;
}

const insertPricesBulkToDB = async (symbol, data) => {
    const query = `
    INSERT INTO stocks_tracker.prices (ticker, date, open, high, low, close)
    VALUES 
    ${data.map((_, i) => {
        const base = i * 6;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
    }).join(', ')}
    ON CONFLICT (ticker, date) DO NOTHING;
`;

    const insertParams = data.reduce((acc, entry) => {
        return acc.concat([
            symbol,
            entry.date,
            parseFloat(entry.open),
            parseFloat(entry.high),
            parseFloat(entry.low),
            parseFloat(entry.close)
        ]);
    }, []);

    const res = await insertUpdateDatabase(query, insertParams);
    logger.info(`Inserted ${res.rowCount || 0} prices in bulk.`);
};

const insertOrUpdateStock = async (args, data) => {
    const {
        symbol,
        regularMarketPrice,
        longName,
        exchangeName,
        fullExchangeName,
        currency
    } = data;
    const query = `
        INSERT INTO stocks_tracker.stocks (ticker, created_date, last_updated_date, market_price, stock_name, exchange, exchange_name, exchange_currency)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (ticker) 
        DO UPDATE 
        SET 
            last_updated_date = EXCLUDED.last_updated_date,
            market_price = EXCLUDED.market_price
    `;

    const params = [symbol, new Date().toISOString(), new Date().toISOString(), regularMarketPrice, longName, exchangeName, fullExchangeName, currency];
    await insertUpdateDatabase(query, params);
    logger.info(`Stock data for ${symbol} has been inserted or updated.`);
};

const logStock = async (symbol, data) => {
    const jsonString = JSON.stringify(data, null, 2);
    await Promise.all([
        fs.writeFile(`${config.stocksFolder}${symbol}.json`, jsonString),
        insertPricesBulkToDB(symbol, data),
    ]);
}

const logMetaData = async (args, metaData) => {
    const jsonString = JSON.stringify(metaData, null, 2);
    await Promise.all([
        fs.writeFile(`${config.stocksFolder}metaData/${metaData.symbol}.json`, jsonString),
        insertOrUpdateStock(args, metaData),
    ]);
}

const getStock = async (ticker, query) => {
    logger.info(`Started Gathering Data for: ${ticker}, ${JSON.stringify(query)}`);
    const url = await getUrl(ticker, query);
    const result = await fetch(url, {
        method: 'get',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36',
        },
    })
    const resultObject = await result.json();

    if (!_.isNil(resultObject?.chart?.error)) throw new Error(`Unable to Find Data for Ticker ${ticker}`);

    logger.info(`Successfully got Stock Data for: ${ticker}`);
    return resultObject.chart.result;
}

const getFormattedData = async (data, ticker) => {
    logger.info(`Started Formatting Data for: ${ticker}`);
    const result = [];
    const timeStamps = data.timestamp;
    const pricingInfo = data.indicators.quote[0];
    const priceHigh = pricingInfo.high;
    const priceLow = pricingInfo.low;
    const priceOpen = pricingInfo.open;
    const priceClose = pricingInfo.close;
    for (let i = 0; i < timeStamps.length; i++) {
        const date = new Date(timeStamps[i] * 1000);
        result.push({
            date: date.toISOString().split('T')[0],
            low: priceLow[i],
            high: priceHigh[i],
            open: priceOpen[i],
            close: priceClose[i]
        })
    }
    logger.info(`Finished Formatting Data for: ${ticker}`);
    return result;
}

module.exports = { getStock, getFormattedData, logMetaData, logStock, validateQuery };