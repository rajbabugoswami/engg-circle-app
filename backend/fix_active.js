const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixActiveEvents() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await connection.query('USE quizlive;');
    console.log("Updating existing events to be active...");
    await connection.query("UPDATE events SET is_active = TRUE WHERE status = 'PENDING';");
    console.log("✅ Existing events are now active!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
  }
}

fixActiveEvents();
