// getNotifications() - Get user notifications
// markAsRead() - Mark notification as read
// deleteNotification() - Delete notification
// markAllAsRead() - Mark all notifications as read

const catchAsync = require("../utils/catchAsync");
const Notification = require("../models/notificationModel");
const AppError = require("../utils/AppError");
const sendSuccessResponse = require("../utils/sendSuccessResponse");
const sendErrorResponse = require("../utils/sendErrorResponse");

/**
 * @desc    Get user notifications
 * @route   GET /api/user/notifications
 * @access  Private
 */
exports.getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const isRead = req.query.isRead; // Optional filter: 'true' or 'false'
  const type = req.query.type; // Optional filter by notification type
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { userId };
  if (isRead !== undefined) {
    filter.isRead = isRead === 'true';
  }
  if (type) {
    filter.type = type;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  sendSuccessResponse(res, 200, 'Notifications retrieved successfully', {
    notifications,
    pagination: {
      currentPage: page,
      totalPages,
      total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    unreadCount
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/user/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  if (!notificationId.match(/^[0-9a-fA-F]{24}$/)) {
    return sendErrorResponse(res, 400, 'Invalid notification ID format');
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    userId: userId
  });

  if (!notification) {
    return sendErrorResponse(res, 404, 'Notification not found');
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  sendSuccessResponse(res, 200, 'Notification marked as read', {
    notification
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/user/notifications/:id
 * @access  Private
 */
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  if (!notificationId.match(/^[0-9a-fA-F]{24}$/)) {
    return sendErrorResponse(res, 400, 'Invalid notification ID format');
  }

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    userId: userId
  });

  if (!notification) {
    return sendErrorResponse(res, 404, 'Notification not found');
  }

  sendSuccessResponse(res, 200, 'Notification deleted successfully');
});

/**
 * @desc    Mark all notifications as read
 * @route   POST /api/user/notifications/mark-all-read
 * @access  Private
 */
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const result = await Notification.updateMany(
    { userId, isRead: false },
    { 
      isRead: true,
      readAt: new Date()
    }
  );

  sendSuccessResponse(res, 200, 'All notifications marked as read', {
    updatedCount: result.modifiedCount
  });
});
