const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: {
      values: ['REGISTRATION', 'PAYMENT', 'EVENT_UPDATE', 'EVENT_REMINDER', 'RESULT', 'SYSTEM', 'OTHER'],
      message: 'Invalid notification type'
    },
    default: 'SYSTEM'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  link: {
    type: String,
    trim: true // URL to related resource (e.g., event page, payment page)
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Store additional data like eventId, registrationId, etc.
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;

