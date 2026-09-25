const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        port: process.env.DATABASE_PORT,
        ssl: { rejectUnauthorized: false }
    });
    
    const hash = bcrypt.hashSync('password123', 10);
    await pool.query('UPDATE admins SET password = ? WHERE email = ?', [hash, 'admin@example.com']);
    console.log("Password updated!");
    process.exit(0);
}
run();
