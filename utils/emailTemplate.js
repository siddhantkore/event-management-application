/**
 * Email Templates for Event Management System
 * Contains all email templates with HTML and text versions
 */

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const emailTemplates = {
  // Welcome email for new users
  welcome: (userData) => ({
    subject: 'Welcome to EventHub - Your Event Journey Starts Here!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to EventHub</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .social-links { margin: 15px 0; }
          .social-links a { margin: 0 10px; color: #667eea; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to EventHub!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userData.firstName || userData.username}!</h2>
            <p>We're thrilled to have you join our community of event enthusiasts! EventHub is your gateway to discovering amazing events and creating unforgettable experiences.</p>
            
            <h3>What you can do with EventHub:</h3>
            <ul>
              <li>🔍 Discover exciting events in your area</li>
              <li>🎟️ Register for events with just a few clicks</li>
              <li>📅 Create and manage your own events</li>
              <li>💳 Secure payment processing</li>
              <li>📊 Track your event history and analytics</li>
            </ul>
            
            <p>Ready to get started? Explore events happening near you:</p>
            <a href="${process.env.FRONTEND_URL}/events" class="button">Explore Events</a>
            
            <p>If you have any questions, our support team is here to help. Simply reply to this email or visit our help center.</p>
            
            <p>Happy event hunting!</p>
            <p><strong>The EventHub Team</strong></p>
          </div>
          <div class="footer">
            <div class="social-links">
              <a href="#">Facebook</a> |
              <a href="#">Twitter</a> |
              <a href="#">Instagram</a>
            </div>
            <p>&copy; 2025 EventHub. All rights reserved.</p>
            <p>You received this email because you signed up for EventHub.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to EventHub!
      
      Hello ${userData.firstName || userData.username}!
      
      We're thrilled to have you join our community of event enthusiasts! 
      
      What you can do with EventHub:
      - Discover exciting events in your area
      - Register for events with just a few clicks
      - Create and manage your own events
      - Secure payment processing
      - Track your event history and analytics
      
      Visit ${process.env.FRONTEND_URL}/events to explore events.
      
      Happy event hunting!
      The EventHub Team
    `
  }),

  // Event registration confirmation
  registrationConfirmation: (registrationData) => ({
    subject: `Registration Confirmed: ${registrationData.event.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmed</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .event-details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .qr-code { text-align: center; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .ticket-info { border: 2px dashed #28a745; padding: 20px; margin: 20px 0; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Registration Confirmed!</h1>
          </div>
          <div class="content">
            <h2>You're all set, ${registrationData.user.firstName || registrationData.user.username}!</h2>
            <p>Your registration for <strong>${registrationData.event.title}</strong> has been confirmed. We can't wait to see you there!</p>
            
            <div class="event-details">
              <h3>📅 Event Details</h3>
              <p><strong>Event:</strong> ${registrationData.event.title}</p>
              <p><strong>Date & Time:</strong> ${formatDate(registrationData.event.startDate)}</p>
              <p><strong>Location:</strong> ${registrationData.event.location.address || registrationData.event.location.venue}</p>
              <p><strong>Organizer:</strong> ${registrationData.event.organizer.name}</p>
              ${registrationData.event.description ? `<p><strong>Description:</strong> ${registrationData.event.description}</p>` : ''}
            </div>
            
            <div class="ticket-info">
              <h3>🎟️ Your Ticket Information</h3>
              <p><strong>Registration ID:</strong> ${registrationData._id}</p>
              <p><strong>Status:</strong> ${registrationData.status.toUpperCase()}</p>
              ${registrationData.qrCode ? `
                <div class="qr-code">
                  <p><strong>Your QR Code:</strong></p>
                  <img src="${registrationData.qrCode}" alt="QR Code" style="max-width: 200px;">
                  <p><small>Present this QR code at the event for check-in</small></p>
                </div>
              ` : ''}
            </div>
            
            <h3>📱 What's Next?</h3>
            <ul>
              <li>Save this email - it contains your ticket information</li>
              <li>Add the event to your calendar</li>
              <li>Check for any event updates in your dashboard</li>
              <li>Arrive 15 minutes early for smooth check-in</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/my-events" class="button">View My Events</a>
            
            <p>If you need to make changes to your registration or have any questions, please contact the event organizer or our support team.</p>
            
            <p>See you at the event!</p>
            <p><strong>The EventHub Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 EventHub. All rights reserved.</p>
            <p>Need help? Contact us at support@eventhub.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Registration Confirmed!
      
      Hello ${registrationData.user.firstName || registrationData.user.username}!
      
      Your registration for "${registrationData.event.title}" has been confirmed.
      
      Event Details:
      - Event: ${registrationData.event.title}
      - Date: ${formatDate(registrationData.event.startDate)}
      - Location: ${registrationData.event.location.address || registrationData.event.location.venue}
      - Organizer: ${registrationData.event.organizer.name}
      
      Registration ID: ${registrationData._id}
      Status: ${registrationData.status.toUpperCase()}
      
      View your events: ${process.env.FRONTEND_URL}/my-events
      
      See you at the event!
      The EventHub Team
    `
  }),

  // Event reminder (24 hours before)
  eventReminder: (registrationData) => ({
    subject: `Tomorrow: ${registrationData.event.title} - Don't Forget!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Reminder</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .event-info { background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Event Reminder</h1>
          </div>
          <div class="content">
            <h2>Don't forget, ${registrationData.user.firstName || registrationData.user.username}!</h2>
            <p>Your event <strong>${registrationData.event.title}</strong> is happening tomorrow. We wanted to remind you so you don't miss out!</p>
            
            <div class="event-info">
              <h3>🎯 Quick Event Details</h3>
              <p><strong>📅 When:</strong> ${formatDate(registrationData.event.startDate)}</p>
              <p><strong>📍 Where:</strong> ${registrationData.event.location.address || registrationData.event.location.venue}</p>
              <p><strong>⏱️ Duration:</strong> ${registrationData.event.duration ? registrationData.event.duration + ' hours' : 'See event details'}</p>
            </div>
            
            <h3>📋 Before You Go:</h3>
            <ul>
              <li>✅ Check the weather and dress appropriately</li>
              <li>✅ Plan your route and parking</li>
              <li>✅ Bring your QR code (in this email or on your phone)</li>
              <li>✅ Arrive 15 minutes early</li>
              <li>✅ Bring any required items mentioned in the event details</li>
            </ul>
            
            ${registrationData.qrCode ? `
              <div style="text-align: center; margin: 20px 0;">
                <p><strong>Your Entry QR Code:</strong></p>
                <img src="${registrationData.qrCode}" alt="QR Code" style="max-width: 200px;">
              </div>
            ` : ''}
            
            <a href="${process.env.FRONTEND_URL}/events/${registrationData.event._id}" class="button">View Event Details</a>
            
            <p>Looking forward to seeing you there!</p>
            <p><strong>The EventHub Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 EventHub. All rights reserved.</p>
            <p>Questions? Contact the organizer or our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Event Reminder - Tomorrow!
      
      Hello ${registrationData.user.firstName || registrationData.user.username}!
      
      Your event "${registrationData.event.title}" is happening tomorrow.
      
      Event Details:
      - When: ${formatDate(registrationData.event.startDate)}
      - Where: ${registrationData.event.location.address || registrationData.event.location.venue}
      
      Don't forget to:
      - Check the weather
      - Plan your route
      - Bring your QR code
      - Arrive 15 minutes early
      
      View event: ${process.env.FRONTEND_URL}/events/${registrationData.event._id}
      
      See you tomorrow!
      The EventHub Team
    `
  }),

  // Payment confirmation
  paymentConfirmation: (paymentData) => ({
    subject: `Payment Confirmed - ${paymentData.event.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .payment-details { background-color: #e8f4f8; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #17a2b8; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Confirmed</h1>
          </div>
          <div class="content">
            <h2>Thank you, ${paymentData.user.firstName || paymentData.user.username}!</h2>
            <p>Your payment for <strong>${paymentData.event.title}</strong> has been successfully processed. Your registration is now confirmed!</p>
            
            <div class="payment-details">
              <h3>💰 Payment Details</h3>
              <p><strong>Amount Paid:</strong> ${formatCurrency(paymentData.amount)}</p>
              <p><strong>Payment Method:</strong> ${paymentData.paymentMethod}</p>
              <p><strong>Transaction ID:</strong> ${paymentData.transactionId}</p>
              <p><strong>Payment Date:</strong> ${formatDate(paymentData.createdAt)}</p>
              <p><strong>Status:</strong> ${paymentData.status.toUpperCase()}</p>
            </div>
            
            <h3>📧 Receipt Information</h3>
            <p>This email serves as your receipt. Please keep it for your records. If you need a formal invoice, you can download it from your dashboard.</p>
            
            <a href="${process.env.FRONTEND_URL}/my-events" class="button">View My Events</a>
            
            <p>Your event registration is now active. You'll receive a separate confirmation email with event details and your ticket information.</p>
            
            <p>If you have any questions about your payment, please don't hesitate to contact our support team.</p>
            
            <p>Thank you for choosing EventHub!</p>
            <p><strong>The EventHub Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 EventHub. All rights reserved.</p>
            <p>For payment inquiries: payments@eventhub.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Payment Confirmed
      
      Hello ${paymentData.user.firstName || paymentData.user.username}!
      
      Your payment for "${paymentData.event.title}" has been successfully processed.
      
      Payment Details:
      - Amount: ${formatCurrency(paymentData.amount)}
      - Payment Method: ${paymentData.paymentMethod}
      - Transaction ID: ${paymentData.transactionId}
      - Date: ${formatDate(paymentData.createdAt)}
      - Status: ${paymentData.status.toUpperCase()}
      
      View your events: ${process.env.FRONTEND_URL}/my-events
      
      Thank you for choosing EventHub!
      The EventHub Team
    `
  }),

  // Event cancellation notice
  eventCancellation: (eventData) => ({
    subject: `Event Cancelled: ${eventData.event.title} - Refund Information`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Cancellation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .cancellation-info { background-color: #f8d7da; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Event Cancelled</h1>
          </div>
          <div class="content">
            <h2>We're sorry, ${eventData.user.firstName || eventData.user.username}</h2>
            <p>Unfortunately, <strong>${eventData.event.title}</strong> scheduled for ${formatDate(eventData.event.startDate)} has been cancelled by the organizer.</p>
            
            <div class="cancellation-info">
              <h3>📋 Cancellation Details</h3>
              <p><strong>Event:</strong> ${eventData.event.title}</p>
              <p><strong>Original Date:</strong> ${formatDate(eventData.event.startDate)}</p>
              <p><strong>Cancellation Date:</strong> ${formatDate(new Date())}</p>
              ${eventData.cancellationReason ? `<p><strong>Reason:</strong> ${eventData.cancellationReason}</p>` : ''}
            </div>
            
            <h3>💰 Refund Information</h3>
            ${eventData.registration.paymentStatus === 'paid' ? `
              <p>Since you paid for this event, a full refund will be processed automatically to your original payment method within 5-7 business days.</p>
              <p><strong>Refund Amount:</strong> ${formatCurrency(eventData.payment.amount)}</p>
              <p><strong>Payment Method:</strong> ${eventData.payment.paymentMethod}</p>
            ` : `
              <p>No payment was required for this event, so no refund is necessary.</p>
            `}
            
            <h3>🔍 What's Next?</h3>
            <ul>
              <li>We'll notify you if the event is rescheduled</li>
              <li>Explore other similar events in your area</li>
              <li>Contact our support team if you have questions</li>
              <li>Watch for refund confirmation (if applicable)</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/events" class="button">Find Other Events</a>
            
            <p>We sincerely apologize for any inconvenience this cancellation may cause. We're here to help you find other amazing events that match your interests.</p>
            
            <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
            
            <p><strong>The EventHub Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 EventHub. All rights reserved.</p>
            <p>Need help? Contact us at support@eventhub.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Event Cancelled
      
      Hello ${eventData.user.firstName || eventData.user.username},
      
      Unfortunately, "${eventData.event.title}" scheduled for ${formatDate(eventData.event.startDate)} has been cancelled.
      
      ${eventData.registration.paymentStatus === 'paid' ? 
        `A full refund of ${formatCurrency(eventData.payment.amount)} will be processed within 5-7 business days.` : 
        'No refund is necessary as this was a free event.'
      }
      
      We'll notify you if the event is rescheduled.
      
      Find other events: ${process.env.FRONTEND_URL}/events
      
      We apologize for any inconvenience.
      The EventHub Team
    `
  }),

  // Password reset email
  passwordReset: (userData, resetToken) => ({
    subject: 'Reset Your EventHub Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${userData.firstName || userData.username}!</h2>
            <p>We received a request to reset your EventHub password. If you made this request, click the button below to set a new password:</p>
            
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" class="button">Reset Password</a>
            
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password won't be changed unless you click the link above</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6c757d;">${process.env.FRONTEND_URL}/reset-password?token=${resetToken}</p>
            
            <p>If you're having trouble or didn't request this reset, please contact our support team immediately.</p>
            
            <p><strong>The EventHub Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 EventHub. All rights reserved.</p>
            <p>For security concerns: security@eventhub.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      Hello ${userData.firstName || userData.username}!
      
      We received a request to reset your EventHub password.
      
      Reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}
      
      This link expires in 1 hour.
      
      If you didn't request this reset, please ignore this email.
      
      The EventHub Team
    `
  }),

  // Event update notification
  eventUpdate: (updateData) => ({
    subject: `Event Update: ${updateData.event.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Update</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #fd7e14 0%, #ffc107 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .update-info { background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #fd7e14 0%, #ffc107 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 Event Update</h1>
          </div>
          <div class="content">
            <h2>Important Update, ${updateData.user.firstName || updateData.user.username}!</h2>
            <p>The event organizer has made important changes to <strong>${updateData.event.title}</strong>. Please review the updates below:</p>
            
            <div class="update-info">
              <h3>🔄 What's Changed</h3>
              ${updateData.changes.map(change => `
                <p><strong>${change.field}:</strong> ${change.oldValue} → ${change.newValue}</p>
              `).join('')}
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3>📅 Updated Event Details</h3>
              <p><strong>Event:</strong> ${updateData.event.title}</p>
              <p><strong>Date & Time:</strong> ${formatDate(updateData.event.startDate)}</p>
              <p><strong>Location:</strong> ${updateData.event.location.address || updateData.event.location.venue}</p>
              <p><strong>Organizer:</strong> ${updateData.event.organizer.name}</p>
            </div>
            
            ${updateData.organizerMessage ? `
              <h3>💬 Message from Organizer</h3>
              <p style="font-style: italic; background-color: #e9ecef; padding: 15px; border-radius: 6px;">"${updateData.organizerMessage}"</p>
            ` : ''}
            
            <a href="${process.env.FRONTEND_URL}/events/${updateData.event._id}" class="button">View Updated Event</a>
            
            <p>If these changes affect your ability to attend, you can update your registration or contact the event organizer.</p>
            
            <p><strong>The EventHub Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 EventHub. All rights reserved.</p>
            <p>Questions? Contact the event organizer or our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Event Update
      
      Hello ${updateData.user.firstName || updateData.user.username}!
      
      Important changes have been made to "${updateData.event.title}":
      
      ${updateData.changes.map(change => `${change.field}: ${change.oldValue} → ${change.newValue}`).join('\n')}
      
      Updated Event Details:
      - Date: ${formatDate(updateData.event.startDate)}
      - Location: ${updateData.event.location.address || updateData.event.location.venue}
      
      ${updateData.organizerMessage ? `Organizer Message: "${updateData.organizerMessage}"` : ''}
      
      View event: ${process.env.FRONTEND_URL}/events/${updateData.event._id}
      
      The EventHub Team
    `
  }),

  // Email verification
  emailVerification: (userData, verificationToken) => ({
    subject: 'Verify Your EventHub Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .verification-code { background-color: #e7f3ff; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Almost there, ${userData.firstName || userData.username}!</h2>
            <p>Thank you for signing up with EventHub! To complete your registration and start discovering amazing events, please verify your email address.</p>
            
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}" class="button">Verify Email Address</a>
            
            <p>Alternatively, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6c757d;">${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}</p>
            
            <div style="background-color: #e7f3ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Why verify your email?</strong></p>
              <ul>
                <li>Receive important event updates and confirmations</li>
                <li>Reset your password if needed</li>
                <li>Get personalized event recommendations</li>
                <li>Ensure account security</li>
              </ul>
            </div>
            
            <p>This verification link will expire in 24 hours. If you didn't create an EventHub account, you can safely ignore this email.</p>
            
            <p>Welcome to the EventHub community!</p>
            <p><strong>The EventHub Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 EventHub. All rights reserved.</p>
            <p>Need help? Contact us at support@eventhub.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Verify Your Email Address
      
      Hello ${userData.firstName || userData.username}!
      
      Welcome to EventHub! Please verify your email address to complete registration.
      
      Verify your email: ${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}
      
      This link expires in 24 hours.
      
      Welcome to EventHub!
      The EventHub Team
    `
  }),

  // New event notification for followers
  newEventNotification: (eventData) => ({
    subject: `New Event from ${eventData.organizer.name}: ${eventData.event.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Event Notification</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .event-card { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #20c997; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Event Alert</h1>
          </div>
          <div class="content">
            <h2>Exciting news, ${eventData.user.firstName || eventData.user.username}!</h2>
            <p><strong>${eventData.organizer.name}</strong>, an organizer you follow, has just announced a new event:</p>
            
            <div class="event-card">
              <h3>${eventData.event.title}</h3>
              <p><strong>📅 When:</strong> ${formatDate(eventData.event.startDate)}</p>
              <p><strong>📍 Where:</strong> ${eventData.event.location.address || eventData.event.location.venue}</p>
              <p><strong>💰 Price:</strong> ${eventData.event.price > 0 ? formatCurrency(eventData.event.price) : 'Free'}</p>
              ${eventData.event.description ? `<p><strong>About:</strong> ${eventData.event.description.substring(0, 150)}${eventData.event.description.length > 150 ? '...' : ''}</p>` : ''}
            </div>
            
            <p>Don't miss out - events from popular organizers fill up quickly!</p>
            
            <a href="${process.env.FRONTEND_URL}/events/${eventData.event._id}" class="button">View Event & Register</a>
            
            <p>Not interested in updates from this organizer? You can manage your preferences in your account settings.</p>
            
            <p>Happy event hunting!</p>
            <p><strong>The EventHub Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 EventHub. All rights reserved.</p>
            <p><a href="${process.env.FRONTEND_URL}/preferences">Manage Email Preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Event Alert
      
      Hello ${eventData.user.firstName || eventData.user.username}!
      
      ${eventData.organizer.name} has announced a new event:
      
      "${eventData.event.title}"
      - When: ${formatDate(eventData.event.startDate)}
      - Where: ${eventData.event.location.address || eventData.event.location.venue}
      - Price: ${eventData.event.price > 0 ? formatCurrency(eventData.event.price) : 'Free'}
      
      View and register: ${process.env.FRONTEND_URL}/events/${eventData.event._id}
      
      Happy event hunting!
      The EventHub Team
    `
  })
};

// Helper function to get template by name
const getTemplate = (templateName, data) => {
  if (!emailTemplates[templateName]) {
    throw new Error(`Template '${templateName}' not found`);
  }
  
  try {
    return emailTemplates[templateName](data);
  } catch (error) {
    throw new Error(`Error generating template '${templateName}': ${error.message}`);
  }
};

// Export the templates and helper function
module.exports = {
  emailTemplates,
  getTemplate,
  formatDate,
  formatCurrency
};