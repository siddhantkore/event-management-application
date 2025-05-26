const PaymentService = require('../service/paymentService')
const paymentService = new PaymentService();

class PaymentController {
  async initiatePayment(req, res) {
    try {
      const { registrationId, couponCode } = req.body;
      
      const registration = await Register.findById(registrationId)
        .populate('eventId')
        .populate('userId');
      
      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      let coupon = null;
      if (couponCode) {
        coupon = await Coupon.findOne({ 
          code: couponCode, 
          isActive: true,
          validFrom: { $lte: new Date() },
          validUntil: { $gte: new Date() }
        });
      }

      const originalAmount = registration.eventId.amount;
      const discount = paymentService.calculateDiscount(originalAmount, coupon);
      const tax = originalAmount * 0.18; // 18% GST
      const finalAmount = originalAmount - discount + tax;

      const receiptId = `receipt_${registration._id}_${Date.now()}`;
      const order = await paymentService.createRazorpayOrder(finalAmount, 'INR', receiptId);

      const payment = new Payment({
        registrationId,
        userId: registration.userId._id,
        eventId: registration.eventId._id,
        amount: {
          original: originalAmount,
          discount,
          tax,
          final: finalAmount
        },
        paymentMethod: 'RAZORPAY',
        paymentGateway: {
          provider: 'RAZORPAY',
          orderId: order.id,
          receiptId
        },
        metadata: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip
        }
      });

      await payment.save();

      res.json({
        success: true,
        paymentId: payment.paymentId,
        order,
        amount: finalAmount,
        currency: 'INR'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async verifyPayment(req, res) {
    try {
      const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
      
      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const isValid = paymentService.verifyRazorpaySignature(
        razorpayOrderId, 
        razorpayPaymentId, 
        razorpaySignature
      );

      if (isValid) {
        payment.status = 'SUCCESS';
        payment.paymentDate = new Date();
        payment.paymentGateway.transactionId = razorpayPaymentId;
        payment.paymentGateway.signature = razorpaySignature;
        
        await payment.save();

        // Update registration status
        await Register.findByIdAndUpdate(payment.registrationId, {
          registrationStatus: 'CONFIRMED',
          paymentStatus: 'COMPLETED',
          transactionId: razorpayPaymentId
        });

        res.json({ success: true, message: 'Payment verified successfully' });
      } else {
        payment.status = 'FAILED';
        await payment.save();
        res.status(400).json({ error: 'Payment verification failed' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPaymentHistory(req, res) {
    try {
      const { page = 1, limit = 10, status, eventId } = req.query;
      
      const filter = { userId: req.user._id };
      if (status) filter.status = status;
      if (eventId) filter.eventId = eventId;

      const payments = await Payment.find(filter)
        .populate('eventId', 'name eventCode')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Payment.countDocuments(filter);

      res.json({
        payments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async processRefund(req, res) {
    try {
      const { paymentId, reason } = req.body;
      
      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.status !== 'SUCCESS') {
        return res.status(400).json({ error: 'Cannot refund unsuccessful payment' });
      }

      const refund = await paymentService.processRefund(
        payment.paymentGateway.transactionId,
        payment.amount.final,
        reason
      );

      payment.refund = {
        refundId: refund.id,
        amount: refund.amount / 100,
        reason,
        refundDate: new Date(),
        status: 'PROCESSING'
      };
      payment.status = 'REFUNDED';

      await payment.save();

      // Update registration status
      await Register.findByIdAndUpdate(payment.registrationId, {
        registrationStatus: 'CANCELLED',
        paymentStatus: 'REFUNDED'
      });

      res.json({ success: true, message: 'Refund processed successfully', refund });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PaymentController;
