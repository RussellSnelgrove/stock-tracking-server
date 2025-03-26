const express = require('express');
// const { getStock } = require('./controllers/stockController.js');

const { hostUrl, hostPort } = require('./config/config.js');
const { getStock } = require('./stocks/getStocks.js');
const logger = require('./utils/logger.js')
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Request: ${req.method} : ${req.url}`);
    next();
});

// consider writing a wrapper function for api calls
// https://zellwk.com/blog/async-await-express/
app.get('/api/stocks', async (req, res) => {
    try {
        const stockData = await getStock(req.query);
        res.send(stockData);
    } catch (error) {
        logger.error(`Request: ${req.method} : ${req.url}`);
        res.send({error: 'something went wrong'});
    }
})



app.listen(hostPort, () => {
    console.log(`Server at ${hostUrl}:${hostPort}`);
});


// app.get('/', (req, res) => {
//     res.send('Server is Ready');
// });


// app.get(('/api/xqq'), (req, res) => {
//     res.json(testStock);
// });
