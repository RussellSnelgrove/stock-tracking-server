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
        // look into a way to log based on absolute path
        new winston.transports.File({ filename: "app.log" })
    ]
});

module.exports = logger;