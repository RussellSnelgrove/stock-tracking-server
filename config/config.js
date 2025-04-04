module.exports = {
    hostUrl: process.env.HOST_URL || 'http://localhost',
    hostPort: process.env.HOST_PORT || 8000,
    logLevel: process.env.LOG_LEVEL || 'info',
    stocksFolder: './stockData/',
    stockEndpoint: {
        urlBase: "https://query2.finance.yahoo.com/v8/finance/chart",
        start: '1970-01-01',
        // end: 1739815200, // tmp, look into how to abstract this out
        interval: '1d',
        includePrePost: true,
        events: 'div|split|earn',
        lang: 'en-CA',
    },
    postgresDB: {
        user: process.env.POSTGRES_USER || 'test',
        password: process.env.POSTGRES_DB || 'password',
        db: process.env.POSTGRES_PASSWORD || 'stock_db'
    },
};
