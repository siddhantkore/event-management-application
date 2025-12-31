const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Register Schema
const registerSchema = new mongoose.Schema({
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
  registrationDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  eventDate: { // Specific date user registered for (if multi-day event)
    type: Date,
    required: [true, 'Event date is required']
  },
  registrationStatus: {
    type: String,
    enum: {
      values: ['PENDING', 'CONFIRMED', 'CANCELLED', 'WAITLISTED'],
      message: 'Registration status must be PENDING, CONFIRMED, CANCELLED, or WAITLISTED'
    },
    default: 'PENDING'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'FREE'],
      message: 'Payment status must be PENDING, COMPLETED, FAILED, REFUNDED, or FREE'
    },
    default: 'FREE'
  },
  amountPaid: {
    type: Number,
    min: [0, 'Amount paid cannot be negative'],
    default: 0
  },
  additionalInfo: {
    dietaryRestrictions: String,
    specialRequirements: String,
    emergencyContact: {
      name: String,
      phone: String
    }
  },
  attendanceStatus: {
    type: String,
    enum: ['REGISTERED', 'ATTENDED', 'NO_SHOW'],
    default: 'REGISTERED'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
registerSchema.index({ eventId: 1, userId: 1 }, { unique: true });
registerSchema.index({ transactionId: 1 }, { sparse: true });

const Register = mongoose.model('Register', registerSchema);
module.exports = Register;