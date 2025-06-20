const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middlewares/auth');
const NotificationService = require('../service/notificationService')

const analyticsController = new AnalyticsController();

router.get('/event/:eventId', authenticate, authorize('ADMIN', 'ORGANIZER'), analyticsController.getEventAnalytics);
router.get('/overview', authenticate, authorize('ADMIN'), analyticsController.getOverallAnalytics);

module.exports = router;
