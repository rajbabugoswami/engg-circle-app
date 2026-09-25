const pool = require('../config/db');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const createPdfBuffer = async (participantId, eventId, certId) => {
  const [pRows] = await pool.query(`
    SELECT p.name, p.score, p.rank_pos, p.email, e.name as event_name, e.event_date, e.cert_template_url, e.cert_template_config
    FROM participants p 
    JOIN events e ON p.event_id = e.id 
    WHERE p.id = ? AND e.id = ?
  `, [participantId, eventId]);

  if (pRows.length === 0) throw new Error('Participant not found');
  const data = pRows[0];

  const pdfDoc = await PDFDocument.create();
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

  const page = pdfDoc.addPage([1123, 794]);
  const { width, height } = page.getSize();
  
  if (bgImage) {
    page.drawImage(bgImage, { x: 0, y: 0, width, height });
  } else {
    page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: rgb(0.2, 0.2, 0.8), borderWidth: 5 });
  }

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  if (bgImage && data.cert_template_config) {
    let config = data.cert_template_config;
    if (typeof config === 'string') {
      try { config = JSON.parse(config); } catch (e) { config = []; }
    }
    
    for (const field of config) {
      if (!field.active) continue;
      let textToDraw = '';
      if (field.id === 'studentName') textToDraw = data.name || '';
      if (field.id === 'eventName') textToDraw = data.event_name || '';
      if (field.id === 'rank') textToDraw = `Rank ${data.rank_pos}`;
      if (field.id === 'date') textToDraw = new Date(data.event_date).toLocaleDateString();
      if (field.id === 'certId') textToDraw = `ID: ${certId}`;

      const hex = (field.color || '#000000').replace('#', '');
      const r = parseInt(hex.substring(0,2), 16) / 255;
      const g = parseInt(hex.substring(2,4), 16) / 255;
      const b = parseInt(hex.substring(4,6), 16) / 255;

      const px = (field.x / 100) * width;
      const py = height - ((field.y / 100) * height);
      
      const textFont = field.id === 'studentName' ? font : normalFont;
      const textWidth = textFont.widthOfTextAtSize(textToDraw, field.fontSize);
      
      let drawX = px;
      if (field.align === 'center') drawX = px - (textWidth / 2);
      if (field.align === 'right') drawX = px - textWidth;

      page.drawText(textToDraw, { x: drawX, y: py, size: field.fontSize, font: textFont, color: rgb(r, g, b) });
    }
  } else {
    if (!bgImage) page.drawText('CERTIFICATE OF PARTICIPATION', { x: width/2 - 250, y: 600, size: 30, font, color: rgb(0.2, 0.2, 0.8) });
    page.drawText(data.name, { x: width/2 - (data.name.length * 9), y: 450, size: 40, font, color: rgb(0, 0, 0) });
    page.drawText(data.event_name, { x: width/2 - (data.event_name.length * 8), y: 350, size: 30, font, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Rank: ${data.rank_pos || '-'}    Score: ${data.score} pts`, { x: width/2 - 120, y: 250, size: 20, font: normalFont });
    page.drawText(`Date: ${new Date(data.event_date).toLocaleDateString()}`, { x: width/2 - 70, y: 200, size: 18, font: normalFont });
    page.drawText(`ID: ${certId}`, { x: 50, y: 50, size: 12, font: normalFont });
  }

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-certificate?id=${certId}`;
  const qrCodeDataUri = await QRCode.toDataURL(verifyUrl);
  const qrImage = await pdfDoc.embedPng(qrCodeDataUri);
  page.drawImage(qrImage, { x: width - 150, y: 50, width: 100, height: 100 });

  return await pdfDoc.save();
};

const generateCertificate = async (req, res) => {
  try {
    const { eventId, participantId } = req.body;
    
    const [existingCert] = await pool.query('SELECT certificate_id, pdf_url FROM certificates WHERE participant_id = ? AND event_id = ?', [participantId, eventId]);
    if (existingCert.length > 0) {
      return res.json({ message: 'Certificate already exists', certificateId: existingCert[0].certificate_id, url: `/api/certificates/download/${existingCert[0].certificate_id}` });
    }

    const [eRows] = await pool.query('SELECT name FROM events WHERE id = ?', [eventId]);
    if (eRows.length === 0) return res.status(404).json({ message: 'Event not found' });

    const eventNamePrefix = eRows[0].name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
    const certId = `CERT-${eventNamePrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // We no longer save to disk here, we just create the DB record.
    await pool.query(
      'INSERT INTO certificates (certificate_id, participant_id, event_id, pdf_url, status) VALUES (?, ?, ?, ?, ?)',
      [certId, participantId, eventId, `/api/certificates/download/${certId}`, 'GENERATED']
    );

    res.json({ message: 'Certificate generated successfully', certificateId: certId, url: `/api/certificates/download/${certId}` });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const [certRows] = await pool.query('SELECT participant_id, event_id FROM certificates WHERE certificate_id = ?', [certificateId]);
    if (certRows.length === 0) return res.status(404).json({ message: 'Certificate not found' });
    
    const pdfBytes = await createPdfBuffer(certRows[0].participant_id, certRows[0].event_id, certificateId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${certificateId}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Download error:', error);
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

    const pdfBytes = await createPdfBuffer(cert.participant_id, cert.event_id, certificateId);

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: cert.email,
      subject: `Your Certificate – ${cert.event_name}`,
      text: `Hello ${cert.name},\n\nCongratulations! You successfully participated in ${cert.event_name}.\nScore: ${cert.score}\nCertificate ID: ${cert.certificate_id}\n\nYour certificate is attached.\n\nFollow us on Instagram for updates:\nhttps://www.instagram.com/the_engg_circle?stkn=a3Rod3RmaW83cTV4`,
      attachments: [{ filename: `${cert.certificate_id}.pdf`, content: Buffer.from(pdfBytes) }]
    });

    await pool.query('UPDATE certificates SET email_status = ? WHERE certificate_id = ?', ['SENT', certificateId]);

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    await pool.query('UPDATE certificates SET email_status = ? WHERE certificate_id = ?', ['FAILED', req.body.certificateId]);
    
    let errorMessage = 'Failed to send email. Check SMTP credentials.';
    if (error.message.includes('Invalid login') || error.message.includes('Authentication')) {
      errorMessage = 'Email Authentication Failed. If using Gmail, you MUST use a 16-letter App Password, not your normal password.';
    }
    
    res.status(500).json({ message: 'Failed to send email', error: errorMessage, rawError: error.message });
  }
};

const resendCertificate = async (req, res) => {
  try {
    const { participantId } = req.params;
    const [cert] = await pool.query('SELECT certificate_id FROM certificates WHERE participant_id = ?', [participantId]);
    if (cert.length === 0) return res.status(404).json({ message: 'Certificate not found' });
    
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
    
    res.json({ message: 'Resend triggered for failed emails. They will process in the background.' });
    
    for (let c of certs) {
      try {
        await pool.query("UPDATE certificates SET email_status = 'PENDING' WHERE certificate_id = ?", [c.certificate_id]);
        
        const mockReq = { body: { certificateId: c.certificate_id } };
        const mockRes = { json: () => {}, status: () => mockRes };
        await sendCertificateEmail(mockReq, mockRes);
      } catch (err) {
        console.error('Error resending cert:', c.certificate_id, err);
      }
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

const triggerBulkCertificateGeneration = async (eventId) => {
  try {
    const [events] = await pool.query('SELECT cert_generation_enabled, auto_email_enabled, certificate_rank_limit FROM events WHERE id = ?', [eventId]);
    if (events.length === 0 || !events[0].cert_generation_enabled) return;
    const autoEmail = events[0].auto_email_enabled;
    const rankLimit = events[0].certificate_rank_limit !== null && events[0].certificate_rank_limit !== undefined 
      ? events[0].certificate_rank_limit 
      : 3;

    const [participants] = await pool.query(`
      SELECT p.id, p.score, COALESCE(SUM(a.time_taken), 0) as total_time 
      FROM participants p 
      LEFT JOIN answers a ON p.id = a.participant_id
      WHERE p.event_id = ? 
      GROUP BY p.id, p.score, p.joined_at
      ORDER BY p.score DESC, total_time ASC, p.joined_at ASC
    `, [eventId]);
    
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const rank = i + 1;
      
      await pool.query('UPDATE participants SET rank_pos = ? WHERE id = ?', [rank, p.id]);
      
      if (rankLimit === 0 || rank <= rankLimit) {
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
    }
  } catch (err) {
    console.error('Bulk generation error:', err);
  }
};

const downloadZip = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [certs] = await pool.query('SELECT certificate_id, participant_id FROM certificates WHERE event_id = ? AND status = "GENERATED"', [eventId]);
    
    if (certs.length === 0) return res.status(404).json({ message: 'No certificates found for this event' });

    const archiver = require('archiver');
    res.attachment(`certificates_${eventId}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => { throw err; });
    archive.pipe(res);
    
    for (const cert of certs) {
      try {
        const pdfBytes = await createPdfBuffer(cert.participant_id, eventId, cert.certificate_id);
        const [p] = await pool.query('SELECT name FROM participants WHERE id = ?', [cert.participant_id]);
        const name = p.length > 0 ? p[0].name.replace(/[^a-zA-Z0-9]/g, '_') : cert.participant_id;
        archive.append(Buffer.from(pdfBytes), { name: `${name}_Certificate.pdf` });
      } catch (err) {
        console.error("Error archiving cert", cert.certificate_id, err);
      }
    }
    
    await archive.finalize();
  } catch (error) {
    console.error('ZIP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { generateCertificate, verifyCertificate, sendCertificateEmail, resendCertificate, resendAllFailed, triggerBulkCertificateGeneration, downloadZip, downloadCertificate };
