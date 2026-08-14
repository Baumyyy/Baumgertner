var pool = require('./db-admin');
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
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)`);
  console.log('Analytics table created!');
  process.exit(0);
}

run().catch(function(e) {
  // 42501 = insufficient_privilege - see init.js for the same check.
  if (e.code === '42501') {
    console.error('Error initializing analytics table: insufficient privileges to run CREATE/ALTER.');
    console.error('Set ADMIN_DB_USER/ADMIN_DB_PASSWORD to superuser credentials and re-run (see backend/db/least-privilege-role.sql).');
  } else {
    console.error(e);
  }
  process.exit(1);
});
