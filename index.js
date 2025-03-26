const express = require('express');
// const { getStock } = require('./controllers/stockController.js');

const { hostUrl, hostPort } = require('./config/config.js');
const { getStock } = require('./stocks/getStocks.js');
const logger = require('./utils/logger.js')
const app = express();
const router = express.Router();

app.use(express.json());

app.use((req, res, next) => {
    console.log('request', req);
    logger.info(`${req.method} ${req.url}`);
    logger.info(`${req}`);
    next();
});

app.get('/api/stocks', (req, res) => {
    const stockData = getStock(req.query);
    res.send(stockData);
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
