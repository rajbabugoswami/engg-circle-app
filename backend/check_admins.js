const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'quizlive',
    port: process.env.DATABASE_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });
  
  const [rows] = await connection.query('SELECT * FROM admins');
  console.log('Admins in DB:', rows);
  await connection.end();
}
check().catch(console.error);
