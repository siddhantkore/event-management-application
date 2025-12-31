const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// All notification routes require authentication
router.get('/', 
    authMiddleware.authenticate,
    authMiddleware.authorize,
    notificationController.getNotifications
);

router.put('/:id/read',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    notificationController.markAsRead
);

router.delete('/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    notificationController.deleteNotification
);

router.post('/mark-all-read',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    notificationController.markAllAsRead
);

module.exports = router;