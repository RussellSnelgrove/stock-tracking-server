const config = require('./config/config.js');
const app = require('./app.js');
const { logger } = require('./utils/logger.js');

app.listen(config.hostPort, async () => {
  logger.info(`Express App Listening on ${config.hostPort}`);
});