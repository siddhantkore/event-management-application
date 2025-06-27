const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  position: {
    type: Number,
    min: [1, 'Position must be at least 1'],
    required: [true, 'Position is required']
  },
  tag: {
    type: String,
    enum: {
      values: ['WINNER', 'RUNNER_UP', 'SECOND_RUNNER_UP', 'PARTICIPANT', 'FINALIST', 'SEMI_FINALIST'],
      message: 'Tag must be a valid achievement level'
    },
    required: [true, 'Achievement tag is required']
  },
  score: {
    type: Number,
    min: [0, 'Score cannot be negative']
  },
  category: {
    type: String,
    trim: true // For events with multiple categories
  },
  prize: {
    description: String,
    value: {
      type: Number,
      min: [0, 'Prize value cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    certificateId: String,
    issuedDate: Date,
    downloadUrl: String
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  announcedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate results
resultSchema.index({ eventId: 1, userId: 1, category: 1 }, { unique: true });
resultSchema.index({ eventId: 1, position: 1 });


const Result = mongoose.model('Result', resultSchema);
module.exports = Result;