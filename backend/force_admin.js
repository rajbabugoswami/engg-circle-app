const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function fixAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log("Connecting...");
    await connection.query('USE quizlive;');
    console.log("Switched to quizlive database.");

    const newEmail = 'sidhnath9670992769@gmail.com';
    const newPassword = 'Sidhnath@1';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log("Updating admin record...");
    // Clear existing admins
    await connection.query('DELETE FROM admins;');
    // Insert new admin
    await connection.query('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)', ['Sidhnath', newEmail, hashedPassword]);
    
    console.log("✅ Admin account forcefully created!");
    console.log("Email:", newEmail);
    console.log("Password:", newPassword);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

fixAdmin();
