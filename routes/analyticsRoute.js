const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middlewares/auth');
const NotificationService = require('../service/notificationService')

const analyticsController = new AnalyticsController();

router.get('/event/:eventId', authenticate, authorize('ADMIN', 'ORGANIZER'), analyticsController.getEventAnalytics);
router.get('/overview', authenticate, authorize('ADMIN'), analyticsController.getOverallAnalytics);

module.exports = router;

// utils/cronJobs.js
const cron = require('node-cron');
const notificationService = new NotificationService();

// Send event reminders 24 hours before event
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily reminder job...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const upcomingEvents = await Event.find({
    startDate: { $gte: tomorrow, $lt: dayAfterTomorrow },
    status: 'UPCOMING'
  });

  for (const event of upcomingEvents) {
    const registrations = await Register.find({ 
      eventId: event._id, 
      registrationStatus: 'CONFIRMED' 
    }).populate('userId');

    for (const registration of registrations) {
      if (registration.userId.preferences.emailNotifications) {
        await notificationService.sendEventReminder(registration.userId, event, registration);
      }
    }
  }
});

// Update event status based on dates
cron.schedule('0 0 * * *', async () => {
  console.log('Updating event statuses...');
  
  const now = new Date();
  
  // Mark events as ONGOING
  await Event.updateMany(
    {
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: 'UPCOMING'
    },
    { status: 'ONGOING' }
  );

  // Mark events as COMPLETED
  await Event.updateMany(
    {
      endDate: { $lt: now },
      status: { $in: ['UPCOMING', 'ONGOING'] }
    },
    { status: 'COMPLETED' }
  );
});

// Clean up expired coupons
cron.schedule('0 2 * * *', async () => {
  console.log('Cleaning up expired coupons...');
  
  await Coupon.updateMany(
    { validUntil: { $lt: new Date() } },
    { isActive: false }
  );
});