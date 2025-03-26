module.exports = {
    hostUrl: process.env.HOST_URL || 'http://localhost',
    hostPort: process.env.HOST_PORT || 8000,
    logLevel: process.env.LOG_LEVEL || 'info',
    stockEndpoint: {
        urlBase: "https://query2.finance.yahoo.com/v8/finance/chart",
        start: 0,
        // end: 1739815200, // tmp, look into how to abstract this out
        interval: '1d',
        include_pre_post: true,
        events: 'div | split | earn',
        lang: 'en - CA',
    },
};
