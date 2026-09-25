const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const sendRegistrationEmail = async (studentEmail, studentName, event) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('Email credentials missing, skipping email send.');
    return false;
  }

  const joinLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join`;

  const mailOptions = {
    from: `"${event.organizer_name || 'Quiz Organizer'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: studentEmail,
    subject: `Registration Successful - ${event.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Registration Successful!</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333;">Hello <strong>${studentName}</strong>,</p>
          <p style="font-size: 16px; color: #333;">You have successfully registered for <strong>${event.name}</strong>.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Quiz Code:</strong> <span style="color: #4f46e5; font-size: 18px;">${event.quiz_code}</span></p>
            <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString()}</p>
            <p style="margin: 0; font-size: 15px;"><strong>Time:</strong> ${event.start_time || 'TBA'}</p>
          </div>

          <p style="font-size: 16px; color: #333;">Please keep this information safe. You can join the quiz by clicking the link below and entering your details along with the Quiz Code.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${joinLink}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Join Quiz Arena</a>
          </div>

          <p style="font-size: 14px; color: #64748b; margin-top: 40px; text-align: center;">
            Regards,<br>
            <strong>${event.organizer_name || 'Event Organizer'}</strong><br>
            ${event.institute_name || ''}
          </p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://www.instagram.com/the_engg_circle?stkn=a3Rod3RmaW83cTV4" target="_blank" style="color: #e1306c; text-decoration: none; font-weight: bold; font-size: 14px;">
              📷 Follow us on Instagram
            </a>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${studentEmail}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${studentEmail}:`, error);
    return false;
  }
};

module.exports = { sendRegistrationEmail };
