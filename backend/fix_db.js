const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixEventsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await connection.query('USE quizlive;');
    console.log("Adding missing columns...");
    await connection.query('ALTER TABLE events ADD COLUMN cert_generation_enabled BOOLEAN DEFAULT TRUE;');
    await connection.query('ALTER TABLE events ADD COLUMN auto_email_enabled BOOLEAN DEFAULT TRUE;');
    await connection.query('ALTER TABLE events ADD COLUMN cert_template_url VARCHAR(255);');
    console.log("✅ Columns added successfully!");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist!");
    } else {
      console.error("Error:", error.message);
    }
  } finally {
    await connection.end();
  }
}

fixEventsTable();
