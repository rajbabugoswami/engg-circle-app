const mysql = require('mysql2/promise');
require('dotenv').config();

async function runPhase1() {
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
    console.log("Updating 'events' table...");
    // Ignoring errors if columns already exist
    await connection.query('ALTER TABLE events ADD COLUMN organizer_name VARCHAR(255);').catch(e => { if(e.code !== 'ER_DUP_FIELDNAME') throw e; });
    await connection.query('ALTER TABLE events ADD COLUMN institute_name VARCHAR(255);').catch(e => { if(e.code !== 'ER_DUP_FIELDNAME') throw e; });
    await connection.query('ALTER TABLE events ADD COLUMN certificate_rank_limit INT DEFAULT 3;').catch(e => { if(e.code !== 'ER_DUP_FIELDNAME') throw e; });
    await connection.query('ALTER TABLE events ADD COLUMN cert_template_config JSON;').catch(e => { if(e.code !== 'ER_DUP_FIELDNAME') throw e; });

    console.log("Updating 'participants' table...");
    await connection.query('ALTER TABLE participants ADD COLUMN course VARCHAR(255);').catch(e => { if(e.code !== 'ER_DUP_FIELDNAME') throw e; });
    await connection.query('ALTER TABLE participants ADD COLUMN year VARCHAR(50);').catch(e => { if(e.code !== 'ER_DUP_FIELDNAME') throw e; });
    await connection.query('ALTER TABLE participants ADD COLUMN roll_number VARCHAR(100);').catch(e => { if(e.code !== 'ER_DUP_FIELDNAME') throw e; });

    console.log("✅ Phase 1 Database Updates Complete!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
  }
}

runPhase1();
