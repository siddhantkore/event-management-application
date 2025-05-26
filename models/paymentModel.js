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
    original: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    final: {
      type: Number,
      required: true,
      min: [0, 'Final amount cannot be negative']
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['RAZORPAY', 'STRIPE', 'PAYPAL', 'UPI', 'NET_BANKING', 'CARD', 'WALLET']
  },
  paymentGateway: {
    provider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE', 'PAYPAL']
    },
    transactionId: String,
    orderId: String,
    signature: String,
    receiptId: String
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIAL_REFUND'],
    default: 'PENDING'
  },
  paymentDate: Date,
  refund: {
    refundId: String,
    amount: Number,
    reason: String,
    refundDate: Date,
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED']
    }
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