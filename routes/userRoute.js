const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.delete('/profile', userController.deleteProfile);

// Admin routes for user management
router.get('/', adminMiddleware, userController.getAllUsers);
router.get('/:id', adminMiddleware, userController.getUserById);
router.put('/:id/status', adminMiddleware, userController.updateUserStatus);
router.delete('/:id', adminMiddleware, userController.deleteUser);

module.exports = router;