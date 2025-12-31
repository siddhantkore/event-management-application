const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    default: () => `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  reportType: {
    type: String,
    enum: ['REGISTRATION', 'FINANCIAL', 'ATTENDANCE', 'COMPREHENSIVE'],
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateRange: {
    from: Date,
    to: Date
  },
  data: {
    type: mongoose.Schema.Types.Mixed // Store report data
  },
  fileUrl: String, // URL to downloadable report file
  status: {
    type: String,
    enum: ['GENERATING', 'COMPLETED', 'FAILED'],
    default: 'GENERATING'
  }
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
