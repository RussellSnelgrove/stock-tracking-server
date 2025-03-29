const path = require("path");
const winston = require("winston");

const config = require('../config/config.js');

const logger = winston.createLogger({
    level: config.logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(__dirname, "../logs", "stocks.log") })
    ]
});

const methodLogger = async (req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl} Started`);
    res.on('finish', () => {
        logger.info(`${req.method} ${req.originalUrl} Finished - Status: ${res.statusCode}`);
    });
    next();
};

module.exports = { logger, methodLogger };