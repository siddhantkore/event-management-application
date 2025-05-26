const ReportService = require('../service/reportService');
const reportService = new ReportService();

class ReportController {
  async generateReport(req, res) {
    try {
      const { eventId, reportType, dateRange, format = 'json' } = req.body;
      
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check if user has permission to generate report for this event
      if (req.user.role !== 'ADMIN' && event.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const reportData = await reportService.generateEventReport(eventId, reportType, dateRange);
      
      const report = new Report({
        eventId,
        reportType,
        generatedBy: req.user._id,
        dateRange,
        data: reportData,
        status: 'COMPLETED'
      });

      if (format === 'pdf') {
        const filePath = await reportService.exportToPDF(reportData, reportType, event.name);
        report.fileUrl = filePath;
      } else if (format === 'excel') {
        const filePath = await reportService.exportToExcel(reportData, reportType, event.name);
        report.fileUrl = filePath;
      }

      await report.save();

      res.json({
        success: true,
        reportId: report.reportId,
        data: reportData,
        downloadUrl: report.fileUrl
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getReportHistory(req, res) {
    try {
      const { page = 1, limit = 10, eventId } = req.query;
      
      const filter = { generatedBy: req.user._id };
      if (eventId) filter.eventId = eventId;

      const reports = await Report.find(filter)
        .populate('eventId', 'name eventCode')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Report.countDocuments(filter);

      res.json({
        reports,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async downloadReport(req, res) {
    try {
      const { reportId } = req.params;
      
      const report = await Report.findOne({ reportId });
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      if (!report.fileUrl) {
        return res.status(400).json({ error: 'Report file not available' });
      }

      res.download(report.fileUrl);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const { eventId } = req.params;
      
      const [registrations, payments, results] = await Promise.all([
        Register.find({ eventId }),
        Payment.find({ eventId, status: 'SUCCESS' }),
        Result.find({ eventId })
      ]);

      const stats = {
        totalRegistrations: registrations.length,
        confirmedRegistrations: registrations.filter(r => r.registrationStatus === 'CONFIRMED').length,
        totalRevenue: payments.reduce((sum, p) => sum + p.amount.final, 0),
        attendanceRate: registrations.length > 0 ? 
          (registrations.filter(r => r.attendanceStatus === 'ATTENDED').length / registrations.length * 100).toFixed(2) : 0,
        winners: results.filter(r => r.tag === 'WINNER').length,
        recentRegistrations: registrations.slice(-5),
        recentPayments: payments.slice(-5)
      };

      res.json({ success: true, stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ReportController;