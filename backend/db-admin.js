var { Pool } = require('pg');
require('dotenv').config();

// Separate elevated-privilege pool used only by the one-off init scripts
// (init.js, init-analytics.js), which run CREATE TABLE/INDEX/ALTER TABLE.
// The runtime app (db.js) connects as the least-privilege portfolio_app
// role, which has no DDL rights - see backend/db/least-privilege-role.sql.
// ADMIN_DB_USER/ADMIN_DB_PASSWORD let you point the init scripts at the
// Postgres superuser without touching DB_USER/DB_PASSWORD, which stay set
// to the app role for db.js. Falls back to DB_USER/DB_PASSWORD so local
// setups that connect as a superuser by default keep working unchanged.
var pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.ADMIN_DB_USER || process.env.DB_USER,
  password: process.env.ADMIN_DB_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

module.exports = pool;
