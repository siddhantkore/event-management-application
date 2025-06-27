const Event = require('../models/eventModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * keep limited initially
 *     Configure and remove unnecessory
 *     Use CI-CD then for improvement after initial deployment
 * 
 */


// Add Pagination here
// In UI provide sorting 
exports.getAllEvents = catchAsync(async (req, res, next) => {
    const events = await Event.find();
    if(!events){
        throw new AppError("No event found", 404);
    }
    res.status(200).json({
        status: 'success',
        data: {
            events
        }
    });
});


exports.getEventByCode = catchAsync(async (req, res, next) => {
    const eventCode = req.eventCode;
    const event = await Event.find();

    if(!event)
        throw new AppError(`No event found with code ${eventCode}`,404);

    res.status(200).json({
        status: 'success',
        data: {
            event
        }
    });

});


exports.deleteEventByCode = catchAsync(async(req,res,next) => {
    const eventCode = req.eventCode;
    const event = await Event.deleteOne({eventCode:eventCode});// Replace with mongoose functions

    if(!event)
        throw new AppError(`Error while deleteing the event with code ${eventCode}`);

    res.status(200).json({
        status: 'success'
    });

});


exports.createEvent = catchAsync(async(req, res, next) => {
    const newEvent=null // get event Doc from req;
    const addedEvent = await Event.insertOne(newEvent);

    if(!addedEvent)
        throw new AppError("Cannot add the event");

    res.status(200).json({
        status: "success"
    });
    
});

exports.getFeaturedEvents = catchAsync(async (req, res, next) => {

    res.status(200).json({
        status:'success',
        data: Data
    })

});
exports.searchEvents = catchAsync(async (req, res, next) => {

    res.status(200).json({
        status:'success',
        data: Data
    })

});
exports.getEventsByCategory = catchAsync(async (req, res, next) => {

    res.status(200).json({
        status:'success',
        data: Data
    })

});
exports.uploadEventImage = catchAsync(async (req, res, next) => {

    res.status(200).json({
        status:'success',
        data: Data
    })

});
exports.getEventAttendees = catchAsync(async (req, res, next) => {

    res.status(200).json({
        status:'success',
        data: Data
    })

});

exports.updateEventStatus = catchAsync(async (req, res, next) => {
    
    
    res.status(200).json({
        status:'success',
        data: Data
    })
});

exports.updateEventByCode = catchAsync(async (req, res, next) => {


});