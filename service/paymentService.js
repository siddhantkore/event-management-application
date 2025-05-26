const Razorpay = require('razorpay');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    // this.razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET
    // });
  }

  async createRazorpayOrder(amount, currency = 'INR', receiptId) {
    try {
      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Amount in smallest currency unit
        currency,
        receipt: receiptId,
        payment_capture: 1
      });
      return order;
    } catch (error) {
      throw new Error(`Payment order creation failed: ${error.message}`);
    }
  }

  verifyRazorpaySignature(orderId, paymentId, signature) {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    return expectedSignature === signature;
  }

  async processRefund(paymentId, amount, reason) {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount * 100,
        notes: { reason }
      });
      return refund;
    } catch (error) {
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }

  calculateDiscount(originalAmount, coupon) {
    if (!coupon) return 0;
    
    if (coupon.discountType === 'PERCENTAGE') {
      const discount = (originalAmount * coupon.discountValue) / 100;
      return coupon.maximumDiscount ? Math.min(discount, coupon.maximumDiscount) : discount;
    } else {
      return Math.min(coupon.discountValue, originalAmount);
    }
  }
}

module.exports = PaymentService;