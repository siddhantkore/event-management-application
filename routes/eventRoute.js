// const express = require('express');
// const router = express.Router();
// const eventController = require('../controllers/eventControlller');
// const authMiddleware = require('../middlewares/auth');
// const eventOwnerMiddleware = require('../middlewares/eventOwner')

// // Public routes
// router.get('/', eventController.getAllEvents);
// router.get('/featured', eventController.getFeaturedEvents);
// router.get('/search', eventController.searchEvents);
// router.get('/category/:category', eventController.getEventsByCategory);
// router.get('/:id', eventController.getEventById);

// // Protected routes
// router.post('/', authMiddleware, eventController.createEvent);
// router.put('/:id', authMiddleware, eventOwnerMiddleware, eventController.updateEvent);
// router.delete('/:id', authMiddleware, eventOwnerMiddleware, eventController.deleteEvent);
// router.post('/:id/image', authMiddleware, upload.single('image'), eventController.uploadEventImage);

// // Event management
// router.get('/:id/attendees', authMiddleware, eventOwnerMiddleware, eventController.getEventAttendees);
// router.post('/:id/duplicate', authMiddleware, eventController.duplicateEvent);
// router.put('/:id/status', authMiddleware, eventOwnerMiddleware, eventController.updateEventStatus);


// module.export = router;


