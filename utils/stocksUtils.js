const _ = require('lodash');
const fs = require('fs').promises;
const Joi = require('joi');

const config = require('../config/config.js');
const { logger } = require('./logger.js')
const { queryDatabase, closeDatabase } = require('./dbConnectionUtils.js');

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
        end = new Date().toLocaleDateString('en-CA'),
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

const logStock = async (symbol, stockObject) => {
    const jsonString = JSON.stringify(stockObject, null, 2);
    await fs.writeFile(`${config.stocksFolder}${symbol}.json`, jsonString);
}

const logMetaData = async (symbol, metaData) => {
    const jsonString = JSON.stringify(metaData);
    await fs.writeFile(`${config.stocksFolder}metaData/${symbol}.json`, jsonString);
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