const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateReport } = require('../middlewares/validation');

const reportController = new ReportController();

router.post('/generate', authenticate, authorize('ADMIN', 'ORGANIZER'), validateReport, reportController.generateReport);
router.get('/history', authenticate, reportController.getReportHistory);
router.get('/download/:reportId', authenticate, reportController.downloadReport);
router.get('/dashboard/:eventId', authenticate, authorize('ADMIN', 'ORGANIZER'), reportController.getDashboardStats);

module.exports = router;