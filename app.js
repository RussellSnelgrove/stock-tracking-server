const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const stocksRouter = require('./routes/stockRoutes.js');

const { methodLogger, logger } = require('./utils/logger.js');

const app = express();
app.use(bodyParser.json());
app.use(methodLogger);

app.use('/api/stocks', stocksRouter);


app.use((err, req, res, next) => {
    logger.error(`Stack: ${err.stack}`);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error.' });
});

module.exports = app;
