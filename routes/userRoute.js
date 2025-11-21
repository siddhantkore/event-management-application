const express = require('express');
const userController = require('../controllers/userController');
const registrationController = require('../controllers/registerController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// User profile routes
router.get('/profile', authMiddleware.authenticate,
     authMiddleware.authorize, userController.getProfile);

router.put('/profile', authMiddleware.authenticate,
     authMiddleware.authorize, userController.updateProfile);

router.delete('/profile', authMiddleware.authenticate,
     authMiddleware.authorize, userController.deleteProfile);

// User event registration route (must be before /:id route)
router.post('/events/:id', authMiddleware.authenticate,
     authMiddleware.authorize, registrationController.createRegistration);

// Admin routes for user management
router.get('/', authMiddleware.authenticate,
     authMiddleware.authorize, adminMiddleware, userController.getAllUsers);

router.get('/:id', authMiddleware.authenticate,
     authMiddleware.authorize, adminMiddleware, userController.getUserById);

router.put('/:id/status', authMiddleware.authenticate,
     authMiddleware.authorize, adminMiddleware, userController.updateUserStatus);
     
router.delete('/:id', authMiddleware.authenticate,
     authMiddleware.authorize, adminMiddleware, userController.deleteUser);

module.exports = router;