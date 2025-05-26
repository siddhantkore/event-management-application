const nodemailer = require('nodemailer');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    this.smsClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async sendPaymentConfirmation(user, payment, event) {
    const emailTemplate = `
      <h2>Payment Confirmation</h2>
      <p>Dear ${user.fullName},</p>
      <p>Your payment for ${event.name} has been successfully processed.</p>
      <div style="background-color: #f5f5f5; padding: 15px; margin: 10px 0;">
        <h3>Payment Details:</h3>
        <p><strong>Payment ID:</strong> ${payment.paymentId}</p>
        <p><strong>Amount:</strong> ₹${payment.amount.final}</p>
        <p><strong>Event:</strong> ${event.name}</p>
        <p><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
      </div>
      <p>Thank you for your registration!</p>
    `;

    await this.emailTransporter.sendMail({
      to: user.email,
      subject: `Payment Confirmation - ${event.name}`,
      html: emailTemplate
    });

    // Send SMS notification if user has SMS enabled
    if (user.preferences.smsNotifications) {
      await this.smsClient.messages.create({
        body: `Payment confirmed for ${event.name}. Amount: ₹${payment.amount.final}. Payment ID: ${payment.paymentId}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phone
      });
    }
  }

  async sendEventReminder(user, event, registration) {
    const emailTemplate = `
      <h2>Event Reminder</h2>
      <p>Dear ${user.fullName},</p>
      <p>This is a reminder for your upcoming event:</p>
      <div style="background-color: #f0f8ff; padding: 15px; margin: 10px 0;">
        <h3>${event.name}</h3>
        <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()}</p>
        <p><strong>Venue:</strong> ${event.venue.name}, ${event.venue.address}</p>
        <p><strong>Registration ID:</strong> ${registration._id}</p>
      </div>
      <p>We look forward to seeing you there!</p>
    `;

    await this.emailTransporter.sendMail({
      to: user.email,
      subject: `Reminder: ${event.name} - Tomorrow`,
      html: emailTemplate
    });
  }

  async sendReportGenerated(user, report, event) {
    const emailTemplate = `
      <h2>Report Generated</h2>
      <p>Dear ${user.fullName},</p>
      <p>Your requested report for ${event.name} has been generated successfully.</p>
      <div style="background-color: #f5f5f5; padding: 15px; margin: 10px 0;">
        <h3>Report Details:</h3>
        <p><strong>Report Type:</strong> ${report.reportType}</p>
        <p><strong>Generated On:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
        <p><strong>Report ID:</strong> ${report.reportId}</p>
      </div>
      ${report.fileUrl ? '<p><a href="' + report.fileUrl + '">Download Report</a></p>' : ''}
      <p>Thank you!</p>
    `;

    await this.emailTransporter.sendMail({
      to: user.email,
      subject: `Report Ready - ${event.name}`,
      html: emailTemplate
    });
  }
}

module.exports = NotificationService;