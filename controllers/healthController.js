const catchAsync = require('../utils/catchAsync');
const redisClient = require('../cache/initializeCache');
const mongoose = require('mongoose');



exports.getHealth = catchAsync(async (req, res, next) => {

  const mongoReady = mongoose.connection.readyState === 1;

  let redisReady = false;
  try {
    await redisClient.ping();
    redisReady = true;
  } catch (err) {
    redisReady = false;
  }

  const isReady = mongoReady && redisReady;

  res.status(isReady ? 200 : 503)
    .json({
      status: isReady ? 'READY' : 'NOT READY',
      dependencies: {
        mongo: mongoReady ? 'UP' : 'DOWN',
        redis: redisReady ? 'UP' : 'DOWN'
      },
      uptime: process.uptime(),
      timestamp: new Date()
    });
});
