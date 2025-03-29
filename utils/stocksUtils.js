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
    await fs.writeFile(`${config.stocksFolder}${symbol.toUpperCase()}.json`, jsonString);
}

const getStock = async (ticker) => {
    logger.info(`Started Gathering Data for: ${ticker}`);
    const url = await getUrl(ticker);
    const result = await fetch(url, {
        method: 'get',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36',
        },
    })
    const resultObject = await result.json();

    if (!_.isNil(resultObject?.chart?.error)) throw new Error(`Unable to Find Data for Ticker ${ticker.toUpperCase()}`);

    await logStock(ticker, resultObject.chart.result);

    logger.info(`Successfully got Stock Data for: ${ticker}`);
    return resultObject.chart.result;
}

module.exports = { getStock };