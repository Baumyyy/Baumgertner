# Baumgertner Portfolio

Personal portfolio website for Anthony Baumgertner.

## Tech Stack

- **Frontend**: React, Vite, React Router
- **Backend**: Node.js, Express, PostgreSQL
- **Deployment**: Docker, nginx, Caddy (TLS)

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run test` — run the test suite
- `npm run lint` — lint the codebase

## Deployment

The stack runs as four Docker Compose services: `db` (Postgres), `backend`
(Express, connects as the least-privilege `portfolio_app` role — see
`backend/db/least-privilege-role.sql`), `frontend` (nginx, not published to
the host directly), and `caddy` (the only service listening on 80/443,
reverse-proxying everything to `frontend`). Because the backend has no DDL
rights at runtime, schema setup is a separate, manual step run as the
Postgres superuser — it does not happen automatically on `docker compose up`.

`caddy` needs `DOMAIN` set in `.env` to a real domain name pointed at the
server (e.g. `baumgertner.fi`) — it requests and renews the Let's Encrypt
certificate for that domain automatically on first boot, no manual cert
setup needed. Certs persist across restarts in the `caddy_data` volume.

### First-time setup

1. Create `.env` in the repo root with at least: `DB_PASSWORD` (Postgres
   superuser password), `APP_DB_USER` / `APP_DB_PASSWORD` (the least-privilege
   role's credentials), `SESSION_SECRET`, `GITHUB_CLIENT_ID` /
   `GITHUB_CLIENT_SECRET` / `GITHUB_ALLOWED_USER` / `GITHUB_CALLBACK_URL`,
   `FRONTEND_URL`, and `DOMAIN` (the domain Caddy requests a certificate for
   — must already point at this server's IP).
2. Start just the database:
   ```bash
   docker compose up -d db
   ```
3. Create the least-privilege role (run once, as superuser):
   ```bash
   docker compose exec -T db psql -U postgres -d portfolio < backend/db/least-privilege-role.sql
   ```
   Then edit the role's password inside that file before running it for real
   (see the comment at the top of the file), and make sure it matches
   `APP_DB_PASSWORD` in `.env`.
4. Start the backend and create the schema as superuser (`ADMIN_DB_USER`/
   `ADMIN_DB_PASSWORD` override the app's normal least-privilege credentials
   for this one command only — see `backend/db-admin.js`):
   ```bash
   docker compose up -d backend
   docker compose exec -e ADMIN_DB_USER=postgres -e ADMIN_DB_PASSWORD=<DB_PASSWORD from .env> backend npm run init-db
   docker compose exec -e ADMIN_DB_USER=postgres -e ADMIN_DB_PASSWORD=<DB_PASSWORD from .env> backend npm run init-db:analytics
   ```
5. Bring up the rest of the stack:
   ```bash
   docker compose up -d
   ```

### Upgrading an existing install

**Run `init-db` (step 4 above) against the new schema before restarting the
backend on a new image**, whenever a change adds a table or column (check
`backend/init.js` / `backend/init-analytics.js` for `CREATE TABLE IF NOT
EXISTS` / `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` — both are safe to
re-run against an existing database). Skipping this locks the admin out: for
example, the `session` table backing login must exist before the backend
that expects it starts, or every request that touches a session fails.

```bash
git pull
docker compose build backend
docker compose run --rm -e ADMIN_DB_USER=postgres -e ADMIN_DB_PASSWORD=<DB_PASSWORD from .env> backend npm run init-db
docker compose up -d
```

(`run --rm` uses the freshly-built image to apply the migration in a
throwaway container, without touching the currently-running backend — so the
site keeps serving on the old schema/code until the final `up -d` swaps it
in.)

---

© 2026 Anthony Baumgertner. All rights reserved.
