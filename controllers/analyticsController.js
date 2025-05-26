const AnalyticsService = require('../service/analyticsService');
const analyticsService = new AnalyticsService();

class AnalyticsController {
  async getEventAnalytics(req, res) {
    try {
      const { eventId } = req.params;
      const { timeframe = '30d' } = req.query;
      
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check permissions
      if (req.user.role !== 'ADMIN' && event.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const analytics = await analyticsService.getEventAnalytics(eventId, timeframe);
      
      res.json({ success: true, analytics });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOverallAnalytics(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const [totalEvents, totalUsers, totalRevenue, totalRegistrations] = await Promise.all([
        Event.countDocuments(),
        User.countDocuments({ role: 'PARTICIPANT' }),
        Payment.aggregate([
          { $match: { status: 'SUCCESS' } },
          { $group: { _id: null, total: { $sum: '$amount.final' } } }
        ]),
        Register.countDocuments()
      ]);

      const recentActivity = await Register.find()
        .populate('userId', 'name')
        .populate('eventId', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({
        success: true,
        overview: {
          totalEvents,
          totalUsers,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalRegistrations,
          recentActivity
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AnalyticsController;