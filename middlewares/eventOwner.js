// Check if user owns the event or is admin
const Event = require('../models/eventModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const eventOwnerMiddleware = catchAsync(async (req, res, next) => {
  const eventCode = req.params.id?.toUpperCase();
  
  if (!eventCode) {
    return next(new AppError('Event code is required', 400));
  }

  const event = await Event.findOne({ eventCode });
  
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Check if user is admin or event owner
  if (req.user.role === 'ADMIN' || event.organizerId.toString() === req.user.id.toString()) {
    req.event = event; // Attach event to request for use in controllers
    return next();
  }

  return next(new AppError('You do not have permission to perform this action', 403));
});

module.exports = eventOwnerMiddleware;