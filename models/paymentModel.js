const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    default: () => `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  invoice: {
    invoiceNumber: String,
    invoiceUrl: String,
    generatedAt: Date
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceInfo: String
  }
}, {
  timestamps: true
});

paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ eventId: 1, status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;