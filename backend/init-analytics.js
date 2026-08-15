var pool = require('./db-admin');
require('dotenv').config();

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY,
      page VARCHAR(255) NOT NULL,
      user_agent TEXT,
      country VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  // Was captured from the request's Referer header, but never surfaced
  // anywhere in the admin UI, and in production nginx's own
  // `Referrer-Policy: no-referrer` header stops the browser from ever
  // sending it on the same-origin pageview call anyway - so this column
  // held real values only in local dev, and was otherwise always empty.
  // Dropped rather than left dead.
  await pool.query(`ALTER TABLE page_views DROP COLUMN IF EXISTS referrer`);
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
