require('dotenv').config();
const pool = require('./src/config/db');
const nodemailer = require('nodemailer');
const { createPdfBuffer } = require('./src/controllers/certificateController');

(async () => {
  try {
    const certificateId = 'CERT-E2EAUTOMAT-O9MH';
    const [rows] = await pool.query(`
      SELECT c.*, p.name, p.email, e.name as event_name 
      FROM certificates c
      JOIN participants p ON c.participant_id = p.id
      JOIN events e ON c.event_id = e.id
      WHERE c.certificate_id = ?
    `, [certificateId]);

    const cert = rows[0];
    console.log("Cert:", cert.name, cert.email);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const pdfBytes = await createPdfBuffer(cert.participant_id, cert.event_id, certificateId);
    console.log("PDF generated, size:", pdfBytes.length);

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: cert.email,
      subject: `Your Certificate – ${cert.event_name}`,
      text: `Hello ${cert.name}, attached is your cert.`,
      attachments: [{ filename: `${cert.certificate_id}.pdf`, content: Buffer.from(pdfBytes) }]
    });

    console.log("Email sent successfully!", info.messageId);
    await pool.query('UPDATE certificates SET email_status = ? WHERE certificate_id = ?', ['SENT', certificateId]);

  } catch (error) {
    console.error("Failed to send email:", error);
  } finally {
    process.exit(0);
  }
})();
