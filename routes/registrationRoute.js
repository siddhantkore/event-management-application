const express = require('express');
const registrationController = require('../controllers/registrationController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Registration routes
router.post('/', registrationController.createRegistration);
router.get('/my-registrations', registrationController.getUserRegistrations);
router.get('/:id', registrationController.getRegistrationById);
router.put('/:id', registrationController.updateRegistration);
router.delete('/:id', registrationController.cancelRegistration);

// Event organizer routes
router.get('/event/:eventId', registrationController.getEventRegistrations);
router.put('/:id/status', registrationController.updateRegistrationStatus);

module.exports = router;