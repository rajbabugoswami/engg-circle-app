const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    console.log("Connecting to the database...");
    
    // Connect to the database using environment variables
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT || 3306,
        ssl: { rejectUnauthorized: false },
        multipleStatements: true // Allows running multiple queries at once
    });

    try {
        console.log("Connected successfully! Creating database and tables...");
        
        // Read schema and seed files
        const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
        const seed = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');

        // Execute schema
        await connection.query(schema);
        console.log("Tables created successfully!");

        // Execute seed
        console.log("Inserting default admin user...");
        await connection.query(seed);
        console.log("Default admin user created successfully!");
        
        console.log("\n=================================");
        console.log("✅ Database Setup Complete!");
        console.log("You can now login to your admin panel.");
        console.log("Email: admin@example.com");
        console.log("Password: password123");
        console.log("=================================\n");

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log("Database already initialized. Admin user already exists!");
        } else {
            console.error("❌ Error setting up database:", error.message);
        }
    } finally {
        await connection.end();
    }
}

run();
