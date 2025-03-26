const path = require("path");

const winston = require("winston");

const { logLevel } = require('../config/config.js');

// Logger setup
const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(__dirname, "../logs", "app.log") })
    ]
});

module.exports = logger;