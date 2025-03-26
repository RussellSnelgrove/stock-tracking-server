const config = require('../config/config.js');
const logger = require('../utils/logger.js')

const getStock = async (query) => {
    logger.info(`getStock: ${JSON.stringify(query)}`);
    const {
        urlBase,
        start,
        end = Date.now(),
        interval,
        includePrePost,
        events,
        // lang
    } = config.stockEndpoint;
    url = `${urlBase}/${query.symbol}?period1=${start}&period2=${end}&interval=${interval}&includePrePost=${includePrePost}&events=${events}&lang=en-CA&region=CA`


    const stockInfo = await fetch(url, {
        method: 'get',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36',
        },
    })
    const data = await stockInfo.json();
    console.log('data', JSON.stringify(data));
    // .then(response => response.json())
    // .then(data => console.log('Response:', data))
    // .catch(error => console.error('Error:', error));
    logger.info(`getStock: ${JSON.stringify(stockInfo)}`);

    return { sample: 'alrighty' };
}

// module.exports = { getStock };
console.log(getStock({ symbol: 'XQQ.TO' }))
// console.log(getStock({ symbol: 'fdfddfxc5cfcdf' }))