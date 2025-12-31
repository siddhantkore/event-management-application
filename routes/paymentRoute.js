const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validatePayment, validateReport } = require('../middlewares/validation');

const paymentController = new PaymentController();

router.post('/initiate', authenticate, validatePayment, paymentController.initiatePayment);
router.post('/verify', authenticate, paymentController.verifyPayment);
router.get('/history', authenticate, paymentController.getPaymentHistory);
router.post('/refund', authenticate, authorize('ADMIN', 'ORGANIZER'), paymentController.processRefund);

module.exports = router;