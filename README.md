<div align="center">

<a href="https://baumgertner.fi">
  <img src="./assets/banner.png" alt="Baumgertner — Portfolio" width="100%" />
</a>

<img src="./assets/divider.svg" width="100%" alt="" />

### Baumgertner Portfolio

A full-stack personal portfolio — **React** on the front, **Express** and **PostgreSQL** behind it,<br/>
self-hosted on a VPS in four Docker containers behind **Caddy** with automatic TLS.

[![Live](https://img.shields.io/badge/LIVE-baumgertner.fi-00ff88?style=for-the-badge&labelColor=0d1117)](https://baumgertner.fi)

</div>

<br/>

<div align="center">

## <img src="./assets/spark-icon.svg" width="22" align="center" alt="" /> &nbsp;Motivation

<img src="./assets/divider.svg" width="100%" alt="" />

</div>

I wanted a portfolio I could actually *own* — not a template on a hosted page builder, but something I built, deploy and maintain myself, end to end.

The easy version of this project is a static site. I deliberately didn't do that. Building a real backend meant working through problems I hadn't dealt with before: an OAuth flow where exactly one GitHub account is authorised, a database user with only the privileges it actually needs instead of connecting as `postgres`, image uploads onto a persistent volume, keeping bots off the contact form, and getting a certificate issued over the DNS-01 challenge so TLS works without exposing a challenge server.

The result runs on a single VPS in four containers, and I understand every one of them.

<br/>

<div align="center">

## <img src="./assets/rocket-icon.svg" width="22" align="center" alt="" /> &nbsp;Key Features

<img src="./assets/divider.svg" width="100%" alt="" />

</div>

- **GitHub OAuth authentication** — single-user allowlist for admin access
- **Image uploads** — stored on a persistent Docker volume and served by the API
- **Contact form** — protected by Cloudflare Turnstile
- **Automatic HTTPS** — Caddy issues and renews certificates via the Cloudflare DNS-01 challenge
- **Health-gated startup** — every container waits for its dependency to report healthy
- **Least-privilege database role** — the app connects as a restricted user, not a superuser
- **Responsive design** — built mobile-first, phone to desktop

<br/>

<div align="center">

## <img src="./assets/layers-icon.svg" width="22" align="center" alt="" /> &nbsp;Architecture

<img src="./assets/divider.svg" width="100%" alt="" />

</div>

Four containers orchestrated with Docker Compose, each with its own healthcheck. Caddy terminates TLS and proxies to nginx, which serves the built frontend; API calls are forwarded to Express, which owns the database and the uploads volume.

```
                         ┌──────────┐
   Internet ──── 443 ───▶│  Caddy   │  TLS · DNS-01 via Cloudflare
                         └────┬─────┘
                              │
                       ┌──────▼──────┐
                       │   nginx     │  serves the Vite build
                       │  (frontend) │
                       └──────┬──────┘
                              │ /api
                       ┌──────▼──────┐        ┌──────────────┐
                       │   Express   │───────▶│  PostgreSQL  │
                       │  (backend)  │        │      17      │
                       └──────┬──────┘        └──────────────┘
                              │
                        uploads volume
```

<div align="center">

#### Frontend

<img src="https://img.shields.io/badge/React_19-0d1117?style=for-the-badge&logo=react&logoColor=00ff88" alt="React" />
<img src="https://img.shields.io/badge/Vite_8-0d1117?style=for-the-badge&logo=vite&logoColor=00ff88" alt="Vite" />
<img src="https://img.shields.io/badge/React_Router-0d1117?style=for-the-badge&logo=reactrouter&logoColor=00ff88" alt="React Router" />
<img src="https://img.shields.io/badge/Vitest-0d1117?style=for-the-badge&logo=vitest&logoColor=00ff88" alt="Vitest" />
<img src="https://img.shields.io/badge/ESLint-0d1117?style=for-the-badge&logo=eslint&logoColor=00ff88" alt="ESLint" />

</div>

- **Framework:** [React 19](https://react.dev) with [Vite 8](https://vite.dev)
- **Routing:** [React Router 7](https://reactrouter.com)
- **Typography:** [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) + [Inter](https://fonts.google.com/specimen/Inter) via Fontsource
- **Bot protection:** [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
- **Testing:** [Vitest](https://vitest.dev) with [Testing Library](https://testing-library.com) and jsdom
- **Code styling:** [ESLint](https://eslint.org)

<div align="center">

#### Backend

<img src="https://img.shields.io/badge/Node.js-0d1117?style=for-the-badge&logo=nodedotjs&logoColor=00ff88" alt="Node.js" />
<img src="https://img.shields.io/badge/Express-0d1117?style=for-the-badge&logo=express&logoColor=00ff88" alt="Express" />
<img src="https://img.shields.io/badge/PostgreSQL_17-0d1117?style=for-the-badge&logo=postgresql&logoColor=00ff88" alt="PostgreSQL" />
<img src="https://img.shields.io/badge/GitHub_OAuth-0d1117?style=for-the-badge&logo=github&logoColor=00ff88" alt="GitHub OAuth" />

</div>

- **Runtime:** [Node.js](https://nodejs.org) with [Express](https://expressjs.com)
- **Database:** [PostgreSQL 17](https://www.postgresql.org)
- **Authentication:** [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps) — single-user allowlist
- **Storage:** Docker volume for uploaded media
- **Access control:** dedicated least-privilege database role

<div align="center">

#### Infrastructure

<img src="https://img.shields.io/badge/Docker-0d1117?style=for-the-badge&logo=docker&logoColor=00ff88" alt="Docker" />
<img src="https://img.shields.io/badge/Caddy-0d1117?style=for-the-badge&logo=caddy&logoColor=00ff88" alt="Caddy" />
<img src="https://img.shields.io/badge/nginx-0d1117?style=for-the-badge&logo=nginx&logoColor=00ff88" alt="nginx" />
<img src="https://img.shields.io/badge/Cloudflare-0d1117?style=for-the-badge&logo=cloudflare&logoColor=00ff88" alt="Cloudflare" />
<img src="https://img.shields.io/badge/GitHub_Actions-0d1117?style=for-the-badge&logo=githubactions&logoColor=00ff88" alt="GitHub Actions" />

</div>

- **Containers:** [Docker](https://www.docker.com) with Docker Compose
- **Web server:** [nginx](https://nginx.org) serving the static build
- **Reverse proxy & TLS:** [Caddy](https://caddyserver.com) with automatic certificates
- **DNS & certificates:** [Cloudflare](https://www.cloudflare.com) DNS-01 challenge
- **CI:** [GitHub Actions](https://github.com/features/actions)
- **Hosting:** [Hostinger](https://www.hostinger.com) VPS

<br/>

<div align="center">

## <img src="./assets/folder-icon.svg" width="22" align="center" alt="" /> &nbsp;Project Structure

<img src="./assets/divider.svg" width="100%" alt="" />

</div>

```
.
├── .github/               # GitHub Actions workflows
├── backend/               # Express API, database layer, migrations
├── public/                # Static assets served as-is
├── scripts/               # Maintenance and setup scripts
├── src/                   # React application source
├── Caddyfile              # Reverse proxy and TLS configuration
├── Caddy.Dockerfile       # Caddy image with the Cloudflare DNS plugin
├── Dockerfile              # Frontend build → nginx
├── docker-compose.yml     # Four-service orchestration
└── nginx.conf             # Static file serving and API proxying
```

<br/>

<div align="center">

## <img src="./assets/key-icon.svg" width="22" align="center" alt="" /> &nbsp;License

<img src="./assets/divider.svg" width="100%" alt="" />

© 2026 Anthony Baumgertner. All rights reserved.

<br/><br/>

<img src="./assets/divider.svg" width="100%" alt="" />

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/wordmark-dark.png" />
  <source media="(prefers-color-scheme: light)" srcset="./assets/wordmark-dark.png" />
  <img src="./assets/wordmark-dark.png" width="360" alt="Anthony Baumgertner" />
</picture>

**[baumgertner.fi](https://baumgertner.fi)** &nbsp;·&nbsp; [LinkedIn](https://www.linkedin.com/in/anthony-baumgertner/) &nbsp;·&nbsp; [GitHub](https://github.com/Baumyyy)

</div>
