const pino = require('pino');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Function to get current date string for filename
const getCurrentDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Function to get log file path
const getLogFilePath = () => {
  const dateString = getCurrentDateString();
  return path.join(logsDir, `app-${dateString}.log`);
};

// Create the logger with multiple transports
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    pid: process.pid,
    hostname: require('os').hostname(),
    service: 'event-management-app'
  }
}, pino.multistream([
  // Console output with pretty formatting (for development)
  {
    level: 'debug',
    stream: pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname,service'
      }
    })
  },
  // File output (for production)
  {
    level: ['debug','info','warn','error'],
    stream: pino.destination({
      dest: getLogFilePath(),
      sync: false,
      mkdir: true
    })
  }
]));

// Enhanced logger with custom methods for event management
const eventLogger = {
  // Standard log levels
  debug: (msg, extra = {}) => logger.debug(extra, msg),
  info: (msg, extra = {}) => logger.info(extra, msg),
  warn: (msg, extra = {}) => logger.warn(extra, msg),
  error: (msg, extra = {}) => logger.error(extra, msg),
  fatal: (msg, extra = {}) => logger.fatal(extra, msg),

  // Custom methods for event management application
  auth: {
    login: (userId, email, ip) => logger.info({
      type: 'AUTH_LOGIN',
      userId,
      email,
      ip,
      timestamp: new Date().toISOString()
    }, `User logged in: ${email}`),

    logout: (userId, email) => logger.info({
      type: 'AUTH_LOGOUT',
      userId,
      email,
      timestamp: new Date().toISOString()
    }, `User logged out: ${email}`),

    permissionDenied: (userId, resource, action, ip) => logger.warn({
      type: 'PERMISSION_DENIED',
      userId,
      resource,
      action,
      ip,
      timestamp: new Date().toISOString()
    }, `Permission denied: User ${userId} attempted ${action} on ${resource}`),

    failedLogin: (email, ip, reason) => logger.warn({
      type: 'AUTH_FAILED',
      email,
      ip,
      reason,
      timestamp: new Date().toISOString()
    }, `Failed login attempt: ${email} from ${ip} - ${reason}`)
  },

  event: {
    created: (eventId, userId, eventName) => logger.info({
      type: 'EVENT_CREATED',
      eventId,
      userId,
      eventName,
      timestamp: new Date().toISOString()
    }, `Event created: ${eventName} by user ${userId}`),

    updated: (eventId, userId, eventName, changes) => logger.info({
      type: 'EVENT_UPDATED',
      eventId,
      userId,
      eventName,
      changes,
      timestamp: new Date().toISOString()
    }, `Event updated: ${eventName} by user ${userId}`),

    deleted: (eventId, userId, eventName) => logger.warn({
      type: 'EVENT_DELETED',
      eventId,
      userId,
      eventName,
      timestamp: new Date().toISOString()
    }, `Event deleted: ${eventName} by user ${userId}`),

    registered: (eventId, userId, eventName) => logger.info({
      type: 'EVENT_REGISTRATION',
      eventId,
      userId,
      eventName,
      timestamp: new Date().toISOString()
    }, `User ${userId} registered for event: ${eventName}`)
  },

  payment: {
    success: (paymentId, userId, amount, eventId) => logger.info({
      type: 'PAYMENT_SUCCESS',
      paymentId,
      userId,
      amount,
      eventId,
      timestamp: new Date().toISOString()
    }, `Payment successful: ${paymentId} - Amount: ${amount}`),

    failed: (paymentId, userId, amount, eventId, reason) => logger.error({
      type: 'PAYMENT_FAILED',
      paymentId,
      userId,
      amount,
      eventId,
      reason,
      timestamp: new Date().toISOString()
    }, `Payment failed: ${paymentId} - Amount: ${amount} - Reason: ${reason}`),

  },

  system: {
    startup: (version, environment) => logger.info({
      type: 'SYSTEM_STARTUP',
      version,
      environment,
      timestamp: new Date().toISOString()
    }, `Application started - Version: ${version}, Environment: ${environment}`),

    shutdown: () => logger.info({
      type: 'SYSTEM_SHUTDOWN',
      timestamp: new Date().toISOString()
    }, 'Application shutdown initiated'),

    error: (error, context = {}) => logger.error({
      type: 'SYSTEM_ERROR',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: new Date().toISOString()
    }, `System error: ${error.message}`),

    databaseConnection: (status, details) => logger.info({
      type: 'DATABASE_CONNECTION',
      status,
      details,
      timestamp: new Date().toISOString()
    }, `Database connection ${status}`)
  },

  api: {
    request: (method, url, userId, ip, userAgent) => logger.debug({
      type: 'API_REQUEST',
      method,
      url,
      userId,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    }, `${method} ${url} - User: ${userId}`),

    response: (method, url, statusCode, responseTime, userId) => logger.info({
      type: 'API_RESPONSE',
      method,
      url,
      statusCode,
      responseTime,
      userId,
      timestamp: new Date().toISOString()
    }, `${method} ${url} - ${statusCode} (${responseTime}ms)`),

    rateLimited: (ip, endpoint, limit) => logger.warn({
      type: 'RATE_LIMIT_EXCEEDED',
      ip,
      endpoint,
      limit,
      timestamp: new Date().toISOString()
    }, `Rate limit exceeded: ${ip} on ${endpoint}`)
  }
};

// Function to rotate logs (call this daily via cron job)
eventLogger.rotateLog = () => {
  const newLogPath = getLogFilePath();
  logger.info({ type: 'LOG_ROTATION', newPath: newLogPath }, 'Log file rotated');
};

// Graceful shutdown handling
process.on('SIGTERM', () => {
  eventLogger.system.shutdown();
  logger.flush(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  eventLogger.system.shutdown();
  logger.flush(() => {
    process.exit(0);
  });
});

module.exports = eventLogger;