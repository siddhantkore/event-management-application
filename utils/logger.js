const pino = require('pino');

const logger = pino({
  transport: {
    target: 'pino-pretty', // optional: for pretty logs in dev
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname'
    }
  },
  level: 'info'
});

module.exports = logger;

/*/ logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',  // minimum level of messages to log
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(), // logs to console
    new winston.transports.File({ filename: 'logs/app.log' }) // logs to file
  ]
});

module.exports = logger;
*/
