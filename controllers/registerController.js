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
    const { eventDate, additionalInfo } = req.body;
    const userId = req.user.id; // assuming auth middleware sets req.user
    const eventId = req.params.id;

    const newRegistration = await Register.create({
        eventId,
        userId,
        eventDate,
        additionalInfo
    });

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
 * @desc    Get all registered user of a event
 * @route   GET /api/admin/events/registrations
 * @access  Private/Admin Only
 * 
 */
exports.getEventRegistrations = catchAsync(async (req, res, next) => {
    const registrations = await Register.find({ eventId: req.params.id })
        .populate('userId');

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