
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Note: Protected routes (if any) should go below
// Example:
// router.get('/me', authController.protect, userController.getMe);

module.exports = router;
