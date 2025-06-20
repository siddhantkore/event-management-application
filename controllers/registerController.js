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