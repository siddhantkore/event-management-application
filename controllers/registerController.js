const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Register = require('../models/registrationModel')


// call the service to keep controller simple and clean

// controllers/registrationController.js

// createRegistration() - Register for an event
// getUserRegistrations() - Get user's registrations
// getRegistrationById() - Get specific registration
// updateRegistration() - Update registration details
// cancelRegistration() - Cancel registration
// getEventRegistrations() - Get all registrations for an event
// updateRegistrationStatus() - Update registration status

/**
 * @desc    register for an event
 * @route   POST /api/users/events/:id
 * @access  Private
 * 
 */
exports.createRegistration = catchAsync(async (req, res, next) => {
    const Event = require('../models/eventModel');
    const { eventDate, additionalInfo } = req.body;
    const userId = req.user.id;
    const eventIdentifier = req.params.id; // Can be eventCode or eventId

    // Find event by code or ID
    let event;
    if (eventIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
        // It's an ObjectId
        event = await Event.findById(eventIdentifier);
    } else {
        // It's an event code
        event = await Event.findOne({ eventCode: eventIdentifier.toUpperCase() });
    }

    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    // Check if event is full
    if (event.isFull) {
        return next(new AppError('Event is full. Registration closed.', 400));
    }

    // Check if user is already registered
    const existingRegistration = await Register.findOne({ 
        eventId: event._id, 
        userId: userId 
    });

    if (existingRegistration && existingRegistration.registrationStatus !== 'CANCELLED') {
        return next(new AppError('You are already registered for this event', 400));
    }

    // Determine payment status based on event amount
    const paymentStatus = event.amount > 0 ? 'PENDING' : 'FREE';

    // Create registration
    const newRegistration = await Register.create({
        eventId: event._id,
        userId,
        eventDate: eventDate ? new Date(eventDate) : event.startDate,
        additionalInfo: additionalInfo || {},
        paymentStatus,
        amountPaid: event.amount > 0 ? 0 : 0
    });

    // Update event current attendees count
    event.currentAttendees = (event.currentAttendees || 0) + 1;
    await event.save();

    // Populate the registration for response
    await newRegistration.populate('eventId', 'name eventCode startDate endDate venue');
    await newRegistration.populate('userId', 'name username email');

    res.status(201).json({
        status: 'success',
        data: {
            registration: newRegistration
        }
    });
});

/**
 * @desc    Get all registered user of a event
 * @route   GET /api/admin/events/registrations
 * @access  Private/Admin Only
 * 
 */
exports.getUserRegistrations = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const registrations = await Register.find({ userId })
        .populate('eventId');

    res.status(200).json({
        status: 'success',
        results: registrations.length,
        data: {
            registrations
        }
    });
});

/**
 * @desc    Get all registered user of a event
 * @route   GET /api/admin/events/registrations
 * @access  Private/Admin Only
 * 
 */
exports.getRegistrationById = catchAsync(async (req, res, next) => {
    const registration = await Register.findById(req.params.id)
        .populate('eventId')
        .populate('userId');

    if (!registration) {
        return next(new AppError('No registration found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            registration
        }
    });
});

/**
 * @desc    Get all registered users of a event and edit
 * @route   GET /api/admin/events/registrations/:id
 * @access  Private/Admin Only
 * 
 */
exports.updateRegistration = catchAsync(async (req, res, next) => {
    const updatedRegistration = await Register.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        });

    if (!updatedRegistration) {
        return next(new AppError('No registration found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            registration: updatedRegistration
        }
    });
});

/**
 * @desc    Get all registered users of an event
 * @route   GET /api/registration/event/:eventId
 * @access  Private (Event owner or Admin)
 * 
 */
exports.getEventRegistrations = catchAsync(async (req, res, next) => {
    const registrations = await Register.find({ eventId: req.params.eventId })
        .populate('userId', 'name username email phone')
        .populate('eventId', 'name eventCode')
        .select('-password')
        .sort({ registrationDate: -1 });

    res.status(200).json({
        status: 'success',
        results: registrations.length,
        data: {
            registrations
        }
    });
});

/**
 * @desc    Get all registrations (Admin only)
 * @route   GET /api/admin/events/registrations
 * @access  Private/Admin Only
 * 
 */
exports.getAllRegistrations = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    if (req.query.registrationStatus) filter.registrationStatus = req.query.registrationStatus;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const [registrations, total] = await Promise.all([
        Register.find(filter)
            .populate('userId', 'name username email phone')
            .populate('eventId', 'name eventCode category')
            .select('-password')
            .sort({ registrationDate: -1 })
            .skip(skip)
            .limit(limit),
        Register.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        status: 'success',
        results: registrations.length,
        data: {
            registrations,
            pagination: {
                currentPage: page,
                totalPages,
                total,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }
    });
});

/**
 * @desc    Get all registered user of a event
 * @route   GET /api/admin/events/registrations
 * @access  Private/Admin Only
 * 
 */
exports.updateRegistrationStatus = catchAsync(async (req, res, next) => {
    const { registrationStatus } = req.body;

    const registration = await Register.findByIdAndUpdate(
        req.params.id,
        { registrationStatus },
        { new: true, runValidators: true }
    );

    if (!registration) {
        return next(new AppError('No registration found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            registration
        }
    });
});

/**
 * @desc    Get all registered user of a event
 * @route   GET /api/admin/events/registrations
 * @access  Private/Admin Only
 * 
 */
exports.cancelRegistration = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const registration = await Register.findOneAndUpdate(
        { _id: req.params.id, userId },
        { registrationStatus: 'CANCELLED' },
        { new: true }
    );

    if (!registration) {
        return next(new AppError('No registration found or not authorized', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            registration
        }
    });
});