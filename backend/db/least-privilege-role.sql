-- Creates a dedicated, least-privilege database role for the app to use at
-- runtime, instead of connecting as the "postgres" superuser.
--
-- Why: if the app or its DB credentials were ever compromised, a superuser
-- connection gives an attacker full control of the whole Postgres instance
-- (every database, every table, role management, etc). A scoped role limits
-- the blast radius to just this app's own tables.
--
-- How to run this (once, against your real database):
--   1. Replace CHANGE_ME_TO_A_STRONG_PASSWORD below with a new, random password.
--   2. Run as the current superuser, e.g.:
--        psql "postgresql://postgres:<postgres_password>@<host>:<port>/portfolio" -f least-privilege-role.sql
--   3. Put that same password in APP_DB_PASSWORD in your .env files, and set
--      APP_DB_USER=portfolio_app. Then restart the backend.
--   4. Once you've confirmed the app works with the new role, you can rotate
--      (change) the postgres superuser password too, since it's no longer
--      used day-to-day by the running app.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'portfolio_app') THEN
    CREATE ROLE portfolio_app WITH LOGIN PASSWORD 'CHANGE_ME_TO_A_STRONG_PASSWORD';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE portfolio TO portfolio_app;
GRANT USAGE ON SCHEMA public TO portfolio_app;

-- Table access: the app only ever needs to read/write rows, never create,
-- drop, or alter tables (that's what init.js / init-analytics.js are for,
-- run manually by you as the superuser).
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO portfolio_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO portfolio_app;

-- Make sure tables created later (future migrations) are covered too.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO portfolio_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO portfolio_app;

-- Explicitly NOT granted: CREATE/DROP/ALTER on the database or schema,
-- role management, and access to any other database on the server.
