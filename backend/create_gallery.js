const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTable() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME || 'quizlive',
        port: process.env.DATABASE_PORT || 3306,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        await connection.query('USE quizlive;');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS gallery (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image_url VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Gallery table created successfully");
    } catch(err) {
        console.log("Error creating table", err);
    } finally {
        await connection.end();
    }
}

createTable();
