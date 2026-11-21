var { Pool } = require('pg');
require('dotenv').config();

var pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// An idle connection that Postgres closes - on a database restart, a
// server reboot, an update to the db container - comes back as an 'error'
// event on the pool. With no listener, Node treats it as unhandled and
// takes the whole backend down with it: the reboot on 21 November 2026
// crashed it this way ("terminating connection due to administrator
// command"), and only Docker's restart policy brought it back. The pool
// has already dropped the dead connection by the time this fires and
// opens a new one for the next query, so logging it is all there is to do.
pool.on('error', function(err) {
  console.error('Database connection lost (pool will reconnect):', err.message);
});

module.exports = pool;