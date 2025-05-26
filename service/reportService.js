const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class ReportService {
  async generateEventReport(eventId, reportType, dateRange) {
    const event = await Event.findById(eventId).populate('organizer');
    
    switch (reportType) {
      case 'REGISTRATION':
        return await this.generateRegistrationReport(eventId, dateRange);
      case 'FINANCIAL':
        return await this.generateFinancialReport(eventId, dateRange);
      case 'ATTENDANCE':
        return await this.generateAttendanceReport(eventId, dateRange);
      case 'COMPREHENSIVE':
        return await this.generateComprehensiveReport(eventId, dateRange);
      default:
        throw new Error('Invalid report type');
    }
  }

  async generateRegistrationReport(eventId, dateRange) {
    const registrations = await Register.find({
      eventId,
      ...(dateRange && {
        registrationDate: {
          $gte: new Date(dateRange.from),
          $lte: new Date(dateRange.to)
        }
      })
    }).populate('userId', 'name email phone').populate('eventId', 'name eventCode');

    const summary = {
      totalRegistrations: registrations.length,
      confirmedRegistrations: registrations.filter(r => r.registrationStatus === 'CONFIRMED').length,
      pendingRegistrations: registrations.filter(r => r.registrationStatus === 'PENDING').length,
      cancelledRegistrations: registrations.filter(r => r.registrationStatus === 'CANCELLED').length,
      attendedCount: registrations.filter(r => r.attendanceStatus === 'ATTENDED').length
    };

    return {
      summary,
      registrations,
      charts: {
        statusDistribution: this.calculateStatusDistribution(registrations),
        dailyRegistrations: this.calculateDailyRegistrations(registrations)
      }
    };
  }

  async generateFinancialReport(eventId, dateRange) {
    const payments = await Payment.find({
      eventId,
      status: 'SUCCESS',
      ...(dateRange && {
        paymentDate: {
          $gte: new Date(dateRange.from),
          $lte: new Date(dateRange.to)
        }
      })
    }).populate('userId', 'name email');

    const summary = {
      totalRevenue: payments.reduce((sum, p) => sum + p.amount.final, 0),
      totalTransactions: payments.length,
      averageTransactionValue: payments.length > 0 ? 
        payments.reduce((sum, p) => sum + p.amount.final, 0) / payments.length : 0,
      totalDiscount: payments.reduce((sum, p) => sum + p.amount.discount, 0),
      totalTax: payments.reduce((sum, p) => sum + p.amount.tax, 0),
      paymentMethodBreakdown: this.calculatePaymentMethodBreakdown(payments)
    };

    return {
      summary,
      payments,
      charts: {
        dailyRevenue: this.calculateDailyRevenue(payments),
        paymentMethods: summary.paymentMethodBreakdown
      }
    };
  }

  async generateAttendanceReport(eventId, dateRange) {
    const registrations = await Register.find({
      eventId,
      ...(dateRange && {
        eventDate: {
          $gte: new Date(dateRange.from),
          $lte: new Date(dateRange.to)
        }
      })
    }).populate('userId', 'name email phone');

    const summary = {
      totalRegistered: registrations.length,
      attended: registrations.filter(r => r.attendanceStatus === 'ATTENDED').length,
      noShow: registrations.filter(r => r.attendanceStatus === 'NO_SHOW').length,
      attendanceRate: registrations.length > 0 ? 
        (registrations.filter(r => r.attendanceStatus === 'ATTENDED').length / registrations.length * 100).toFixed(2) : 0
    };

    return {
      summary,
      attendanceList: registrations,
      charts: {
        attendanceOverTime: this.calculateAttendanceOverTime(registrations)
      }
    };
  }

  async generateComprehensiveReport(eventId, dateRange) {
    const [registrationData, financialData, attendanceData] = await Promise.all([
      this.generateRegistrationReport(eventId, dateRange),
      this.generateFinancialReport(eventId, dateRange),
      this.generateAttendanceReport(eventId, dateRange)
    ]);

    return {
      registration: registrationData,
      financial: financialData,
      attendance: attendanceData,
      overview: {
        eventPerformance: this.calculateEventPerformance(registrationData, financialData, attendanceData)
      }
    };
  }

  async exportToPDF(reportData, reportType, eventName) {
    const doc = new PDFDocument();
    const fileName = `${reportType}_${eventName}_${Date.now()}.pdf`;
    const filePath = path.join('uploads/reports', fileName);

    doc.pipe(fs.createWriteStream(filePath));
    
    // PDF content generation
    doc.fontSize(20).text(`${reportType} Report - ${eventName}`, 50, 50);
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);
    
    // Add report content based on type
    this.addReportContentToPDF(doc, reportData, reportType);
    
    doc.end();
    return filePath;
  }

  async exportToExcel(reportData, reportType, eventName) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${reportType} Report`);
    
    // Add headers and data based on report type
    this.addReportContentToExcel(worksheet, reportData, reportType);
    
    const fileName = `${reportType}_${eventName}_${Date.now()}.xlsx`;
    const filePath = path.join('uploads/reports', fileName);
    
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  // Helper methods for calculations
  calculateStatusDistribution(registrations) {
    const distribution = {};
    registrations.forEach(reg => {
      distribution[reg.registrationStatus] = (distribution[reg.registrationStatus] || 0) + 1;
    });
    return distribution;
  }

  calculateDailyRegistrations(registrations) {
    const daily = {};
    registrations.forEach(reg => {
      const date = reg.registrationDate.toISOString().split('T')[0];
      daily[date] = (daily[date] || 0) + 1;
    });
    return daily;
  }

  calculatePaymentMethodBreakdown(payments) {
    const breakdown = {};
    payments.forEach(payment => {
      breakdown[payment.paymentMethod] = (breakdown[payment.paymentMethod] || 0) + payment.amount.final;
    });
    return breakdown;
  }

  calculateDailyRevenue(payments) {
    const daily = {};
    payments.forEach(payment => {
      const date = payment.paymentDate.toISOString().split('T')[0];
      daily[date] = (daily[date] || 0) + payment.amount.final;
    });
    return daily;
  }
}

module.exports = ReportService;