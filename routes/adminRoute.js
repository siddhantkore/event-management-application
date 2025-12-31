const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const registerController = require('../controllers/registerController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

// Admin user management routes
router.get('/users', 
    authMiddleware.authenticate,
    authMiddleware.authorize,
    adminMiddleware,
    userController.getAllUsers
);

router.get('/users/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    adminMiddleware,
    userController.getUserById
);

router.patch('/users/:id/status',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    adminMiddleware,
    userController.updateUserStatus
);

router.delete('/users/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    adminMiddleware,
    userController.deleteUser
);

// Admin event registrations route
router.get('/events/registrations',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    adminMiddleware,
    registerController.getAllRegistrations
);

module.exports = router;

