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
