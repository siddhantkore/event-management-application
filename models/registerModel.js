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
  transactionId: {
    type: String,
    trim: true,
    sparse: true, // Allows multiple null values for free events
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional for free events
        return /^[A-Za-z0-9]{10,50}$/.test(value);
      },
      message: 'Transaction ID must be alphanumeric and 10-50 characters long'
    }
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
  paymentMethod: {
    type: String,
    enum: ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET', 'CASH', 'FREE'],
    default: 'FREE'
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
  },
  checkInTime: Date,
  checkOutTime: Date
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
registerSchema.index({ eventId: 1, userId: 1 }, { unique: true });
registerSchema.index({ transactionId: 1 }, { sparse: true });

const Register = mongoose.model('Register', registerSchema);
module.exports = Register;