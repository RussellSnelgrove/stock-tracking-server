const _ = require('lodash');
const fs = require('fs').promises;

const config = require('../config/config.js');
const logger = require('../utils/logger.js')

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


const getStock = async (query) => {
    const symbol = query.symbol;
    logger.info(`Started to gather stock data for: ${symbol}`);

    const url = await getUrl(symbol);
    console.log('url', url);
    const result = await fetch(url, {
        method: 'get',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36',
        },
    })
    const resultObject = await result.json();
    if (!_.isNil(resultObject?.chart?.error)) {
        logger.error(`Error with gathering stock data for: ${symbol}`);
        return { error: 'something ent wrong' }
    }

    await logStock(symbol, resultObject?.chart?.result);

    logger.info(`Successfully got stock data for: ${symbol}`);
    return { sample: 'alrighty' };
}

// module.exports = { getStock };
// const xqq = getStock({ symbol: 'XQfQ.TO' });