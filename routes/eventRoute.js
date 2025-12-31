const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/auth');
const eventOwnerMiddleware = require('../middlewares/eventOwner');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/search', eventController.searchEvents);
router.get('/category/:category', eventController.getEventsByCategory);
router.get('/:id', eventController.getEventByCode);

// Protected routes
router.post('/', 
    authMiddleware.authenticate,
    authMiddleware.authorize,
    eventController.createEvent
);

router.put('/:id', 
    authMiddleware.authenticate,
    authMiddleware.authorize,
    eventOwnerMiddleware,
    eventController.updateEventByCode
);

router.delete('/:id', 
    authMiddleware.authenticate,
    authMiddleware.authorize,
    eventOwnerMiddleware,
    eventController.deleteEventByCode
);

// router.post('/:id/image', authMiddleware.authenticate, authMiddleware.authorize, upload.single('image'), eventController.uploadEventImage);

// Event management
router.get('/:id/attendees', 
    authMiddleware.authenticate,
    authMiddleware.authorize,
    eventOwnerMiddleware,
    eventController.getEventAttendees
);

// router.post('/:id/duplicate', authMiddleware.authenticate, authMiddleware.authorize, eventController.duplicateEvent);

router.put('/:id/status', 
    authMiddleware.authenticate,
    authMiddleware.authorize,
    eventOwnerMiddleware,
    eventController.updateEventStatus
);


module.exports = router;


