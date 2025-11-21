const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CertificateService {
  constructor() {
    this.certificatesDir = path.join(__dirname, '../public/certificates');
    // Ensure certificates directory exists
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true });
    }
  }

  /**
   * Generate a certificate PDF for a result
   * @param {Object} result - Result object with populated eventId and userId
   * @returns {Object} Certificate data with certificateId and downloadUrl
   */
  async generateCertificate(result) {
    try {
      const certificateId = `CERT_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const fileName = `${certificateId}.pdf`;
      const filePath = path.join(this.certificatesDir, fileName);
      
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Pipe PDF to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Certificate design
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Background color
      doc.rect(0, 0, pageWidth, pageHeight)
         .fillColor('#f8f9fa')
         .fill();

      // Border
      doc.strokeColor('#2c3e50')
         .lineWidth(5)
         .rect(30, 30, pageWidth - 60, pageHeight - 60)
         .stroke();

      // Decorative border
      doc.strokeColor('#3498db')
         .lineWidth(2)
         .rect(50, 50, pageWidth - 100, pageHeight - 100)
         .stroke();

      // Title
      doc.fillColor('#2c3e50')
         .fontSize(36)
         .font('Helvetica-Bold')
         .text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 120, {
           align: 'center',
           width: pageWidth - 100
         });

      // Subtitle
      doc.fillColor('#7f8c8d')
         .fontSize(18)
         .font('Helvetica')
         .text('This is to certify that', pageWidth / 2, 180, {
           align: 'center',
           width: pageWidth - 100
         });

      // Participant name
      const participantName = `${result.userId.name.firstName} ${result.userId.name.lastName}`;
      doc.fillColor('#2c3e50')
         .fontSize(32)
         .font('Helvetica-Bold')
         .text(participantName, pageWidth / 2, 220, {
           align: 'center',
           width: pageWidth - 100
         });

      // Achievement description
      const achievementText = this.getAchievementText(result.tag, result.position);
      doc.fillColor('#34495e')
         .fontSize(16)
         .font('Helvetica')
         .text(achievementText, pageWidth / 2, 280, {
           align: 'center',
           width: pageWidth - 150
         });

      // Event name
      doc.fillColor('#34495e')
         .fontSize(16)
         .font('Helvetica')
         .text(`in the event "${result.eventId.name}"`, pageWidth / 2, 320, {
           align: 'center',
           width: pageWidth - 150
         });

      // Event code and date
      const eventDate = new Date(result.eventId.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      doc.fillColor('#7f8c8d')
         .fontSize(12)
         .font('Helvetica')
         .text(`Event Code: ${result.eventId.eventCode} | Date: ${eventDate}`, pageWidth / 2, 360, {
           align: 'center',
           width: pageWidth - 150
         });

      // Score if available
      if (result.score !== undefined && result.score !== null) {
        doc.fillColor('#34495e')
           .fontSize(14)
           .font('Helvetica')
           .text(`Score: ${result.score}`, pageWidth / 2, 390, {
             align: 'center',
             width: pageWidth - 150
           });
      }

      // Position
      if (result.position) {
        const positionText = this.getPositionText(result.position);
        doc.fillColor('#e74c3c')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(`Position: ${positionText}`, pageWidth / 2, 420, {
             align: 'center',
             width: pageWidth - 150
           });
      }

      // Signature line
      doc.fillColor('#2c3e50')
         .fontSize(12)
         .font('Helvetica')
         .text('_________________________', pageWidth / 2, 480, {
           align: 'center',
           width: pageWidth - 150
         });

      doc.fillColor('#7f8c8d')
         .fontSize(10)
         .font('Helvetica')
         .text('Event Organizer', pageWidth / 2, 500, {
           align: 'center',
           width: pageWidth - 150
         });

      // Certificate ID
      doc.fillColor('#95a5a6')
         .fontSize(8)
         .font('Helvetica')
         .text(`Certificate ID: ${certificateId}`, 60, pageHeight - 40);

      // Date issued
      const issuedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Issued on: ${issuedDate}`, pageWidth - 200, pageHeight - 40);

      // Finalize PDF
      doc.end();

      // Wait for stream to finish
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Generate download URL
      const downloadUrl = `/certificates/${fileName}`;

      return {
        certificateId,
        downloadUrl,
        filePath
      };
    } catch (error) {
      throw new Error(`Certificate generation failed: ${error.message}`);
    }
  }

  /**
   * Get achievement text based on tag
   */
  getAchievementText(tag, position) {
    switch (tag) {
      case 'WINNER':
        return 'has achieved First Place';
      case 'RUNNER_UP':
        return 'has achieved Second Place';
      case 'SECOND_RUNNER_UP':
        return 'has achieved Third Place';
      case 'FINALIST':
        return 'has reached the Finals';
      case 'SEMI_FINALIST':
        return 'has reached the Semi-Finals';
      case 'PARTICIPANT':
        return 'has successfully participated';
      default:
        return 'has achieved recognition';
    }
  }

  /**
   * Get position text with ordinal suffix
   */
  getPositionText(position) {
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = position % 100;
    return position + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  }

  /**
   * Delete certificate file
   */
  async deleteCertificate(fileName) {
    try {
      const filePath = path.join(this.certificatesDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Certificate deletion failed: ${error.message}`);
    }
  }
}

module.exports = new CertificateService();
