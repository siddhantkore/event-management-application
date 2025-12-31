const { body, validationResult } = require('express-validator');

const validatePayment = [
  body('registrationId').isMongoId().withMessage('Valid registration ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentMethod').isIn(['RAZORPAY', 'STRIPE', 'PAYPAL', 'UPI', 'NET_BANKING', 'CARD', 'WALLET'])
    .withMessage('Invalid payment method'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateReport = [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('reportType').isIn(['REGISTRATION', 'FINANCIAL', 'ATTENDANCE', 'COMPREHENSIVE'])
    .withMessage('Invalid report type'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validatePayment,
  validateReport
};
