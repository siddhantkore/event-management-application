const Event = require('../models/eventModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');



// Add Pagination here

/**
 * @desc Getting all events with pagination
 * @route /api/events/
 * @access All users with sign in as well as without
 * 
 */
exports.getAllEvents = catchAsync(async (req, res, next) => {

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 20;
    const skip = (page - 1) * limit;

    const events = await Event.find().skip(skip).limit(limit);

    if (!events) {
        throw new AppError("No event found", 404);
    }

    res.status(200).json({
        status: 'success',
        results: events.length,
        data: {
            events
        }
    });
});

/**
 * @desc
 * @route
 * @access
 * 
 */ 

exports.getEventByCode = catchAsync(async (req, res, next) => {

    const event = await Event.findOne({ eventCode: req.params.id.toUpperCase() });

    if (!event) {
        return next(new AppError(`No event found with code ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            event
        }
    });

});

/**
 * @desc
 * @route
 * @access
 * 
 */ 
exports.deleteEventByCode = catchAsync(async (req, res, next) => {

    const deletedEvent = await Event.findOneAndDelete({ eventCode: req.params.id.toUpperCase() });

    if (!deletedEvent) {
        return next(new AppError(`No event found with code ${req.params.id}`, 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });

});

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Public (or Protected later)
 * 
 */
exports.createEvent = catchAsync(async (req, res, next) => {
    console.log(req.body);
  // 1. Get event data from request body
  const newEvent = req.body;

  // 2. Create event in database
  const addedEvent = await Event.create(newEvent);

  // 3. Safety check (optional but good practice)
  if (!addedEvent) {
    return next(new AppError('Cannot add the event', 400));
  }

  // 4. Send response
  res.status(201).json({
    status: 'success',
    data: {
      event: addedEvent,
    },
  });
});


/**
 * @desc
 * @route
 * @access
 * 
 */

exports.getFeaturedEvents = catchAsync(async (req, res, next) => {

    const events = await Event.find({ status: 'UPCOMING' })
        .sort({ startDate: 1 })
        .limit(25);

    res.status(200).json({
        status: 'success',
        data: {
            events
        }
    });
});

/**
 * @desc Search events by name, category, or tags implement UI strategically
 * @route   GET /api/events/search?query=keyword
 * @access
 * 
 */
exports.searchEvents = catchAsync(async (req, res, next) => {

    const { query } = req.query;

    const events = await Event.find({
        $or: [
            { name: new RegExp(query, 'i') },
            { category: new RegExp(query, 'i') },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ]
    });

    res.status(200).json({
        status: 'success',
        results: events.length,
        data: {
            events
        }
    });
});

/**
 * @desc    Get events by category
 * @route   GET /api/events/category/:category
 * @access  Public
 * 
 */ 
exports.getEventsByCategory = catchAsync(async (req, res, next) => {
    const { category } = req.params;

    const events = await Event.find({ category });

    res.status(200).json({
        status: 'success',
        results: events.length,
        data: {
            events
        }
    });
});

/**
 *  @desc
 * @route
 * @access
 */ /* 

exports.uploadEventImage = catchAsync(async (req, res, next) => {

    res.status(200).json({
        status: 'success',
        data: Data
    })

}); */

/**
 * @desc    Get attendees of an event (to be implemented)
 * @route   GET /api/events/:id/attendees
 * @access  Private event owner
 * 
 */
exports.getEventAttendees = catchAsync(async (req, res, next) => {

    res.status(200).json({
        status: 'success',
        data: Data
    })

});

/**
 * @desc Not configured Yet
 * @route 
 * @access
 */
exports.updateEventStatus = catchAsync(async (req, res, next) => {


    res.status(200).json({
        status: 'success',
        data: Data
    })
});


/**
 * @desc
 * @route
 * @access
 */ 
exports.updateEventByCode = catchAsync(async (req, res, next) => {

    const updatedEvent = await Event.findOneAndUpdate(
        {
            eventCode: req.params.id.toUpperCase()
        },
        req.body,
        {
            new: true, runValidators: true
        });

    if (!updatedEvent) {
        return next(new AppError(`No event found with code ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            event: updatedEvent
        }
    });

});
