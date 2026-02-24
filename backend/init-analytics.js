var pool = require('./db');
require('dotenv').config();

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY,
      page VARCHAR(255) NOT NULL,
      referrer VARCHAR(500),
      user_agent TEXT,
      country VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Analytics table created!');
  process.exit(0);
}

run().catch(function(e) { console.error(e); process.exit(1); });
