# Security Policy

Thank you for helping keep this project and the people who use
[baumgertner.fi](https://baumgertner.fi) safe.

## Supported versions

This is a personal portfolio, not a library, so there are no released
versions to support. Only the code on the `main` branch and the site
running at **baumgertner.fi** are maintained. Reports about older
commits are welcome if the issue still exists on `main`.

## Reporting a vulnerability

**Please do not open a public issue, pull request or discussion for a
security problem.**

Report it privately in one of these ways:

1. **GitHub private vulnerability reporting**: open the
   [Security tab](https://github.com/Baumyyy/Baumgertner/security) of
   this repository and choose *Report a vulnerability*.
2. **Email**: [contact@baumgertner.fi](mailto:contact@baumgertner.fi),
   with "Security" in the subject line.

Please include:

- what the issue is and where it is (URL, endpoint or file and line)
- steps to reproduce it, or a minimal proof of concept
- what an attacker could do with it
- your name or handle if you would like to be credited

You can write in English or Finnish.

## What to expect

This project is maintained by one person, so these are honest targets
rather than guarantees:

| Step | Target |
|---|---|
| Acknowledging your report | within 5 days |
| First assessment (confirmed or not, and severity) | within 14 days |
| Fix for a confirmed issue | as soon as possible, depending on severity |

I will keep you updated as I work on it and let you know when the fix
is live. With your permission, I will credit you once it is resolved.
There is no bug bounty.

## Scope

**In scope**

- the website at `baumgertner.fi` and `www.baumgertner.fi`
- the backend API under `/api`
- the admin area and its GitHub sign-in
- the code, Docker and Caddy configuration in this repository

**Out of scope**

- denial-of-service or load testing of any kind
- automated scanner output with no demonstrated impact
- social engineering or phishing
- physical attacks, or attacks on the hosting provider, Cloudflare,
  GitHub or Resend
- missing best-practice headers or settings with no exploitable impact
- vulnerabilities in third-party dependencies that do not affect this
  site (Dependabot already tracks these)

## Testing rules

If you test against the live site:

- use only your own data, and never access, change or delete anyone
  else's
- do not send spam through the contact form
- stop and report as soon as you have confirmed an issue; do not go
  further than necessary to show it
- give me reasonable time to fix the issue before telling anyone else

Research done in good faith within these rules will not be met with
legal action.

## How the project protects itself

For context, here is what is already in place:

- HTTPS everywhere, through Cloudflare and Caddy with automatically
  renewed certificates
- security headers (including CSP and HSTS), set by nginx for the site
  and by Helmet for the API
- a Cloudflare bot check on the contact form
- rate limiting on the API, sign-in, contact form and analytics
  endpoints
- an admin area that only accepts one allow-listed GitHub account, with
  short-lived sessions stored server-side in PostgreSQL
- secrets kept in environment variables, never in the repository
- Dependabot checking npm and Docker dependencies every week, and CI
  running lint, build and tests on every push

A machine-readable contact is also published at
[`/.well-known/security.txt`](https://baumgertner.fi/.well-known/security.txt).
