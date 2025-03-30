const _ = require('lodash');
const fs = require('fs').promises;

const config = require('../config/config.js');
const { logger } = require('./logger.js')

const getUrl = async (symbol) => {
    const {
        urlBase,
        start,
        end = Date.now(),
        interval,
        includePrePost,
        events,
        lang
    } = config.stockEndpoint;
    const url = `${urlBase}/${symbol}?period1=${start}&period2=${end}&interval=${interval}&includePrePost=${includePrePost}&events=${events}&lang=${lang}&region=CA`
    return url;
}

const logStock = async (symbol, stockObject) => {
    const jsonString = JSON.stringify(stockObject, null, 2);
    await fs.writeFile(`${config.stocksFolder}${symbol}.json`, jsonString);
}

const logMetaData = async (symbol, metaData) => {
    const jsonString = JSON.stringify(stockObject, null, 2);
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
    await logStock(ticker, result);
    logger.info(`Finished Formatting Data for: ${ticker}`);
    return result;
}

module.exports = { getStock, getFormattedData, logMetaData };