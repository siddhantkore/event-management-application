const AnalyticsService = require('../service/analyticsService');
const analyticsService = new AnalyticsService();
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');
const Register = require('../models/registrationModel');
const Result = require('../models/resultModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendSuccessResponse = require('../utils/sendSuccessResponse');
const sendErrorResponse = require('../utils/sendErrorResponse');

// aimed to control analytics related operations
// event-specific analytics and overall platform analytics
// how many events created, user sign-ups, revenue generated, registration trends
// registrations for a specific event over time, user demographics, popular events

class AnalyticsController {
  /**
   * @desc    Get analytics for a specific event
   * @route   GET /api/analytics/event/:eventId
   * @access  Private (Admin or Event Organizer)
   */
  async getEventAnalytics(req, res) {
    try {
      const { eventId } = req.params;
      const { timeframe = '30d' } = req.query;
      
      if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
        return sendErrorResponse(res, 400, 'Invalid event ID format');
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return sendErrorResponse(res, 404, 'Event not found');
      }

      // Check permissions
      if (req.user.role !== 'ADMIN' && event.organizerId.toString() !== req.user.id.toString()) {
        return sendErrorResponse(res, 403, 'Access denied. You must be the event organizer or admin.');
      }

      const analytics = await analyticsService.getEventAnalytics(eventId, timeframe);
      
      sendSuccessResponse(res, 200, 'Event analytics retrieved successfully', {
        event: {
          id: event._id,
          name: event.name,
          eventCode: event.eventCode
        },
        timeframe,
        analytics
      });
    } catch (error) {
      sendErrorResponse(res, 500, `Error retrieving analytics: ${error.message}`);
    }
  }

  /**
   * @desc    Get overall platform analytics
   * @route   GET /api/analytics/overview
   * @access  Private (Admin only)
   */
  async getOverallAnalytics(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return sendErrorResponse(res, 403, 'Access denied. Admin access required.');
      }

      // Get total counts
      const [totalEvents, totalUsers, totalParticipants, totalOrganizers, totalRegistrations, totalResults] = await Promise.all([
        Event.countDocuments(),
        User.countDocuments(),
        User.countDocuments({ role: 'PARTICIPANT' }),
        User.countDocuments({ role: 'ORGANIZER' }),
        Register.countDocuments(),
        Result.countDocuments()
      ]);

      // Get revenue analytics
      const revenueData = await Payment.aggregate([
        { $match: { status: 'SUCCESS' } },
        { 
          $group: { 
            _id: null, 
            totalRevenue: { $sum: '$amount.final' },
            totalTransactions: { $sum: 1 },
            averageTransaction: { $avg: '$amount.final' }
          } 
        }
      ]);

      const revenue = revenueData[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0
      };

      // Get events by status
      const eventsByStatus = await Event.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get registrations by status
      const registrationsByStatus = await Register.aggregate([
        {
          $group: {
            _id: '$registrationStatus',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get payment status breakdown
      const paymentsByStatus = await Payment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount.final' }
          }
        }
      ]);

      // Get recent activity
      const recentRegistrations = await Register.find()
        .populate('userId', 'name username')
        .populate('eventId', 'name eventCode')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('userId eventId registrationStatus registrationDate');

      const recentEvents = await Event.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name eventCode status startDate createdAt');

      // Get popular events (by registration count)
      const popularEvents = await Register.aggregate([
        {
          $group: {
            _id: '$eventId',
            registrationCount: { $sum: 1 }
          }
        },
        { $sort: { registrationCount: -1 } },
        { $limit: 10 }
      ]);

      // Populate popular events
      const popularEventsData = await Event.populate(popularEvents, {
        path: '_id',
        select: 'name eventCode category status'
      });

      // Get registration trends (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const registrationTrends = await Register.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Get user signup trends (last 30 days)
      const userSignupTrends = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      sendSuccessResponse(res, 200, 'Overall analytics retrieved successfully', {
        overview: {
          totalEvents,
          totalUsers,
          totalParticipants,
          totalOrganizers,
          totalRegistrations,
          totalResults,
          revenue: {
            totalRevenue: revenue.totalRevenue,
            totalTransactions: revenue.totalTransactions,
            averageTransaction: Math.round(revenue.averageTransaction * 100) / 100
          }
        },
        breakdowns: {
          eventsByStatus: eventsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          registrationsByStatus: registrationsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          paymentsByStatus: paymentsByStatus.map(item => ({
            status: item._id,
            count: item.count,
            totalAmount: item.totalAmount
          }))
        },
        trends: {
          registrationTrends: registrationTrends.map(item => ({
            date: item._id,
            count: item.count
          })),
          userSignupTrends: userSignupTrends.map(item => ({
            date: item._id,
            count: item.count
          }))
        },
        popularEvents: popularEventsData.map(item => ({
          event: item._id,
          registrationCount: item.registrationCount
        })),
        recentActivity: {
          registrations: recentRegistrations,
          events: recentEvents
        }
      });
    } catch (error) {
      sendErrorResponse(res, 500, `Error retrieving overall analytics: ${error.message}`);
    }
  }
}

module.exports = AnalyticsController;