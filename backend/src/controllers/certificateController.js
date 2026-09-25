const pool = require('../config/db');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const generateCertificate = async (req, res) => {
  try {
    const { eventId, participantId } = req.body;
    
    // Fetch participant and event details
    const [pRows] = await pool.query(`
      SELECT p.name, p.score, p.rank_pos, p.email, e.name as event_name, e.event_date, e.cert_template_url 
      FROM participants p 
      JOIN events e ON p.event_id = e.id 
      WHERE p.id = ? AND e.id = ?
    `, [participantId, eventId]);

    if (pRows.length === 0) return res.status(404).json({ message: 'Participant not found' });
    const data = pRows[0];

    const certId = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed custom template if available
    let bgImage;
    if (data.cert_template_url) {
      const imgPath = path.join(__dirname, '../../', data.cert_template_url);
      if (fs.existsSync(imgPath)) {
        const imgBytes = fs.readFileSync(imgPath);
        if (imgPath.toLowerCase().endsWith('.png')) {
          bgImage = await pdfDoc.embedPng(imgBytes);
        } else if (imgPath.toLowerCase().match(/\.(jpg|jpeg)$/)) {
          bgImage = await pdfDoc.embedJpg(imgBytes);
        }
      }
    }

    const page = pdfDoc.addPage([1123, 794]); // A4 Landscape roughly
    const { width, height } = page.getSize();
    
    if (bgImage) {
      page.drawImage(bgImage, { x: 0, y: 0, width, height });
    } else {
      page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: rgb(0.2, 0.2, 0.8), borderWidth: 5 });
    }

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Draw Text (Centered relatively)
    if (!bgImage) page.drawText('CERTIFICATE OF PARTICIPATION', { x: width/2 - 250, y: 600, size: 30, font, color: rgb(0.2, 0.2, 0.8) });
    
    page.drawText(data.name, { x: width/2 - (data.name.length * 9), y: 450, size: 40, font, color: rgb(0, 0, 0) });
    page.drawText(data.event_name, { x: width/2 - (data.event_name.length * 8), y: 350, size: 30, font, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Rank: ${data.rank_pos || '-'}    Score: ${data.score} pts`, { x: width/2 - 120, y: 250, size: 20, font: normalFont });
    page.drawText(`Date: ${new Date(data.event_date).toLocaleDateString()}`, { x: width/2 - 70, y: 200, size: 18, font: normalFont });
    
    page.drawText(`ID: ${certId}`, { x: 50, y: 50, size: 12, font: normalFont });

    // Generate QR Code
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-certificate?id=${certId}`;
    const qrCodeDataUri = await QRCode.toDataURL(verifyUrl);
    
    const qrImage = await pdfDoc.embedPng(qrCodeDataUri);
    page.drawImage(qrImage, { x: width - 150, y: 50, width: 100, height: 100 });

    const pdfBytes = await pdfDoc.save();
    
    const uploadsDir = path.join(__dirname, '../../uploads/certificates');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, `${certId}.pdf`);
    fs.writeFileSync(filePath, pdfBytes);

    // Save to DB
    await pool.query(
      'INSERT INTO certificates (certificate_id, participant_id, event_id, pdf_url, status) VALUES (?, ?, ?, ?, ?)',
      [certId, participantId, eventId, `/uploads/certificates/${certId}.pdf`, 'GENERATED']
    );

    res.json({ message: 'Certificate generated successfully', certificateId: certId, url: `/uploads/certificates/${certId}.pdf` });

  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const [rows] = await pool.query(`
      SELECT c.certificate_id, c.pdf_url, c.generated_at, p.name, p.score, p.rank_pos, e.name as event_name, e.event_date 
      FROM certificates c
      JOIN participants p ON c.participant_id = p.id
      JOIN events e ON c.event_id = e.id
      WHERE c.certificate_id = ?
    `, [certificateId]);

    if (rows.length === 0) return res.status(404).json({ message: 'Certificate not found' });
    res.json({ verified: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const sendCertificateEmail = async (req, res) => {
  try {
    const { certificateId } = req.body;
    const [rows] = await pool.query(`
      SELECT c.*, p.name, p.email, e.name as event_name 
      FROM certificates c
      JOIN participants p ON c.participant_id = p.id
      JOIN events e ON c.event_id = e.id
      WHERE c.certificate_id = ?
    `, [certificateId]);

    if (rows.length === 0) return res.status(404).json({ message: 'Certificate not found' });
    const cert = rows[0];

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const filePath = path.join(__dirname, '../../', cert.pdf_url);

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: cert.email,
      subject: `Your Certificate – ${cert.event_name}`,
      text: `Hello ${cert.name},\n\nCongratulations! You successfully participated in ${cert.event_name}.\nScore: ${cert.score}\nCertificate ID: ${cert.certificate_id}\n\nYour certificate is attached.`,
      attachments: [{ filename: `${cert.certificate_id}.pdf`, path: filePath }]
    });

    await pool.query('UPDATE certificates SET email_status = ? WHERE certificate_id = ?', ['SENT', certificateId]);

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    await pool.query('UPDATE certificates SET email_status = ? WHERE certificate_id = ?', ['FAILED', req.body.certificateId]);
    res.status(500).json({ message: 'Failed to send email' });
  }
};

const resendCertificate = async (req, res) => {
  try {
    const { participantId } = req.params;
    const [cert] = await pool.query('SELECT certificate_id FROM certificates WHERE participant_id = ?', [participantId]);
    if (cert.length === 0) return res.status(404).json({ message: 'Certificate not found' });
    
    // Call the internal send logic (re-using the logic from sendCertificateEmail)
    // For simplicity here, just calling the same logic:
    req.body.certificateId = cert[0].certificate_id;
    return sendCertificateEmail(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const resendAllFailed = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [certs] = await pool.query("SELECT certificate_id FROM certificates WHERE event_id = ? AND email_status = 'FAILED'", [eventId]);
    
    // In a real app we'd queue these, but for now we'll trigger them sequentially
    for (let c of certs) {
      // Very simplified resend loop (ignoring individual responses)
      // Ideally, a background job handles this
      pool.query("UPDATE certificates SET email_status = 'PENDING' WHERE certificate_id = ?", [c.certificate_id]);
    }
    res.json({ message: 'Resend triggered for failed emails' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const triggerBulkCertificateGeneration = async (eventId) => {
  try {
    const [events] = await pool.query('SELECT cert_generation_enabled, auto_email_enabled FROM events WHERE id = ?', [eventId]);
    if (events.length === 0 || !events[0].cert_generation_enabled) return;
    const autoEmail = events[0].auto_email_enabled;

    const [participants] = await pool.query('SELECT id FROM participants WHERE event_id = ? ORDER BY score DESC, joined_at ASC', [eventId]);
    
    for (let p of participants) {
      // Mock request/response objects to reuse generateCertificate logic safely
      // In production, we'd extract the logic into a separate reusable service function.
      const req = { body: { eventId, participantId: p.id } };
      let generatedCertId = null;
      
      const res = {
        json: (data) => { if (data.certificateId) generatedCertId = data.certificateId; },
        status: () => res
      };
      
      await generateCertificate(req, res);
      
      if (generatedCertId && autoEmail) {
        const emailReq = { body: { certificateId: generatedCertId } };
        const emailRes = { json: () => {}, status: () => emailRes };
        await sendCertificateEmail(emailReq, emailRes);
      }
    }
  } catch (err) {
    console.error('Bulk generation error:', err);
  }
};

module.exports = { generateCertificate, verifyCertificate, sendCertificateEmail, resendCertificate, resendAllFailed, triggerBulkCertificateGeneration };
