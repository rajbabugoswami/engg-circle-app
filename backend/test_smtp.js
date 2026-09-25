const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  console.log("Testing SMTP connection with:");
  console.log("HOST:", process.env.SMTP_HOST);
  console.log("PORT:", process.env.SMTP_PORT);
  console.log("USER:", process.env.SMTP_USER ? 'SET' : 'MISSING');
  console.log("PASS:", process.env.SMTP_PASSWORD ? 'SET' : 'MISSING');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    debug: true,
    logger: true
  });

  try {
    console.log("Verifying connection...");
    await transporter.verify();
    console.log("SMTP Connection Successful!");
    process.exit(0);
  } catch (error) {
    console.error("SMTP Error Object:", error);
    process.exit(1);
  }
}

testSMTP();
