const express = require('express');
const registrationController = require('../controllers/registerController');
const authMiddleware = require('../middlewares/auth');
const eventOwnerMiddleware = require('../middlewares/eventOwner');

const router = express.Router();

// Registration routes (protected)
router.post('/', 
    authMiddleware.authenticate,
    authMiddleware.authorize,
    registrationController.createRegistration
);

router.get('/my-registrations',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    registrationController.getUserRegistrations
);

router.get('/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    registrationController.getRegistrationById
);

router.put('/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    registrationController.updateRegistration
);

router.delete('/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    registrationController.cancelRegistration
);

// Event organizer routes
router.get('/event/:eventId',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    registrationController.getEventRegistrations
);

router.put('/:id/status',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    registrationController.updateRegistrationStatus
);

module.exports = router;