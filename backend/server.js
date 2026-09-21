var express = require('express');
var cors = require('cors');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var session = require('express-session');
var PgSession = require('connect-pg-simple')(session);
var pool = require('./db');
var { Resend } = require('resend');
var compression = require('compression');
require('dotenv').config();

// ===== REQUIRED ENV VARS =====
var REQUIRED_ENV_VARS = [
  'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
  'SESSION_SECRET',
  'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GITHUB_ALLOWED_USER',
  'FRONTEND_URL'
];
var missingEnvVars = REQUIRED_ENV_VARS.filter(function(name) { return !process.env[name]; });
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variable(s): ' + missingEnvVars.join(', '));
  process.exit(1);
}

var app = express();
app.use(compression());
app.set('trust proxy', 1);
var PORT = process.env.PORT || 3001;

// Input validation helpers
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var isValidLength = function(str, max) {
  return typeof str === 'string' && str.length > 0 && str.length <= max;
};
// Verifies a Cloudflare Turnstile token against the siteverify endpoint.
// Fails open (returns true without making a request) when TURNSTILE_SECRET
// isn't set, so the contact/testimonial forms keep working in local dev
// without provisioning Cloudflare keys - logs a warning so that's obvious
// rather than silent if it's ever unintentional in a real deployment.
var verifyTurnstile = async function(token, ip) {
  if (!process.env.TURNSTILE_SECRET) {
    console.warn('TURNSTILE_SECRET not set - skipping CAPTCHA verification');
    return true;
  }
  if (!token || typeof token !== 'string') return false;
  try {
    var params = new URLSearchParams();
    params.append('secret', process.env.TURNSTILE_SECRET);
    params.append('response', token);
    if (ip) params.append('remoteip', ip);
    var res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    var data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('Turnstile verification request failed:', err.message);
    return false;
  }
};

var sendNotification = async function(subject, html) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_EMAIL) return;
  try {
    var resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM || 'Portfolio <onboarding@resend.dev>',
      to: process.env.NOTIFICATION_EMAIL,
      subject: subject,
      html: html
    });
  } catch (err) {
    console.log('Email failed:', err.message);
  }
};

// Security
var helmet = require('helmet');
var rateLimit = require('express-rate-limit');

app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://challenges.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://challenges.cloudflare.com'],
      frameSrc: ["'self'", 'https://challenges.cloudflare.com'],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(function(req, res, next) {
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()');
  next();
});

// ===== SECURITY EVENT LOGGING & ALERTING =====
// Logs every rate-limit trip and, if they cluster (possible bot/abuse
// traffic), emails a single debounced alert rather than one per request.
var SECURITY_ALERT_COOLDOWN = 30 * 60 * 1000;
var SECURITY_ALERT_THRESHOLD = 20;
var lastSecurityAlertAt = 0;

var logSecurityEvent = function(req) {
  var ip = req.ip || 'unknown';
  var route = req.originalUrl || req.path || 'unknown';
  pool.query('INSERT INTO security_events (ip, route) VALUES ($1,$2)', [ip, route])
    .catch(function(err) { console.error('Security event log failed:', err.message); });

  var now = Date.now();
  if (now - lastSecurityAlertAt < SECURITY_ALERT_COOLDOWN) return;

  pool.query("SELECT COUNT(*) FROM security_events WHERE created_at > NOW() - INTERVAL '10 minutes'")
    .then(function(r) {
      var count = parseInt(r.rows[0].count, 10);
      if (count < SECURITY_ALERT_THRESHOLD) return;
      lastSecurityAlertAt = now;
      sendNotification(
        'Security alert: unusual traffic on your site',
        '<h3>Unusual traffic detected</h3>' +
        '<p>' + count + ' rate-limited requests in the last 10 minutes.</p>' +
        '<p>Check the Security tab in the admin dashboard for details.</p>'
      );
    })
    .catch(function(err) { console.error('Security alert check failed:', err.message); });
};

var rateLimitHandler = function(req, res, next, options) {
  logSecurityEvent(req);
  res.status(options.statusCode).json(options.message);
};

// A single dev machine (hot-reload, repeated logins while testing, browser
// automation) generates far more requests than a real visitor ever would -
// so the strict limits below only apply in production; local dev gets a
// much looser budget to avoid tripping over its own traffic.
var IS_PROD = process.env.NODE_ENV === 'production';

var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 150 : 3000,
  message: { error: 'Too many requests, try again later' },
  handler: rateLimitHandler
});

// Shared between /api/auth/github and its /callback, so one login attempt
// costs 2 of this budget (initiate + return from GitHub) - 7 allows a
// handful of real attempts/hour (new device, expired session, mistyped
// GitHub login) while still capping abuse of the OAuth flow hard.
var authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: IS_PROD ? 7 : 200,
  message: { error: 'Too many login attempts, try again later' },
  handler: rateLimitHandler
});

var messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  // Four, not three: a client who double-taps send on a flaky connection
  // and then spots a typo in their own address needs a third attempt, and
  // being locked out for an hour at that point reads as the site being
  // broken.
  max: IS_PROD ? 4 : 200,
  message: { error: 'Too many messages, try again later' },
  handler: rateLimitHandler
});

var pageviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 20 : 500,
  message: { error: 'Too many requests, try again later' },
  handler: rateLimitHandler
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Deliberately above the rate limiter: Docker polls this every 15s, and a
// health check that can be rate-limited reports the service as down at
// exactly the moment the service is busiest.
//
// It checks the database rather than just answering, because this is what
// docker-compose gates the frontend container on - a backend that is
// listening but cannot reach Postgres is not ready to be depended on.
//
// The compose healthcheck used to call /api/profile, which was removed
// with the profile routes. Nothing failed at the time because nothing
// redeployed; the next deploy would have hung with the backend stuck
// unhealthy and the frontend waiting on it forever.
app.get('/api/health', async function(req, res) {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});

app.use('/api', apiLimiter);

// Session
app.use(session({
  store: new PgSession({ pool: pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // Admin session - short-lived on purpose (was 24h) so being logged in
    // doesn't linger indefinitely; expires on its own after 40 minutes of
    // being issued regardless of activity, not tied to any particular
    // page load or refresh (the server can't reliably tell a hard refresh
    // apart from a normal one - both just carry the same cookie).
    maxAge: 40 * 60 * 1000,
    httpOnly: true,
    // 'auto' (not a hardcoded NODE_ENV check) asks express-session to look
    // at whether the request actually arrived over HTTPS - via `req.secure`,
    // which honors X-Forwarded-Proto because of `trust proxy` above. Behind
    // Caddy in production that's true, so the cookie is still Secure there;
    // testing the production build locally over plain HTTP (no Caddy) no
    // longer silently drops the session cookie the way a flat
    // NODE_ENV === 'production' check did.
    secure: 'auto',
    sameSite: 'lax'
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback'
}, function(accessToken, refreshToken, profile, done) {
  if (profile.username === process.env.GITHUB_ALLOWED_USER) {
    return done(null, { username: profile.username, avatar: profile.photos[0].value });
  } else {
    return done(null, false, { message: 'Not authorized' });
  }
}));

// ===== AUTH MIDDLEWARE =====
var auth = function(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// ===== GITHUB AUTH ROUTES =====
app.get('/api/auth/github', authLimiter, passport.authenticate('github', { scope: ['user:email'] }));

var FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.get('/api/auth/github/callback',
  authLimiter,
  passport.authenticate('github', { failureRedirect: FRONTEND_URL + '/baumi-dashboard?error=unauthorized' }),
  function(req, res) {
    res.redirect(FRONTEND_URL + '/baumi-dashboard');
  }
);

app.get('/api/auth/me', function(req, res) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/api/auth/logout', function(req, res) {
  req.logout(function() {
    req.session.destroy(function() {
      // Browsers only clear a cookie if these options match the ones it was
      // set with (path/secure/sameSite/httpOnly) - Express docs are explicit
      // about this. Without them, the DB-side session row is gone but the
      // browser keeps sending the old cookie, so a plain clearCookie() call
      // with no options silently does nothing.
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: req.secure,
        sameSite: 'lax'
      });
      res.json({ loggedOut: true });
    });
  });
});

// ===== MESSAGES (public: send) =====
app.post('/api/messages', messageLimiter, async function(req, res) {
  try {
    var { name, email, message, website, turnstileToken } = req.body;
    if (website) {
      return res.json({ id: 0, name: name, email: email, message: message });
    }
    if (!(await verifyTurnstile(turnstileToken, req.ip))) {
      return res.status(400).json({ error: 'CAPTCHA verification failed' });
    }
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }
    if (!isValidLength(name, 100) || !isValidLength(email, 254) || !isValidLength(message, 5000)) {
      return res.status(400).json({ error: 'One or more fields exceed the maximum length' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    var result = await pool.query(
      'INSERT INTO messages (name, email, message) VALUES ($1,$2,$3) RETURNING *',
      [name, email, message]
    );

    // No per-submission email here - see sendDigestNotification below.

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== MESSAGES (admin) =====
app.get('/api/messages', auth, async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 500');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.put('/api/messages/:id/read', auth, async function(req, res) {
  try {
    var result = await pool.query(
      'UPDATE messages SET read=true WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.delete('/api/messages/:id', auth, async function(req, res) {
  try {
    await pool.query('DELETE FROM messages WHERE id=$1', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== DASHBOARD STATS (admin) =====
app.get('/api/admin/stats', auth, async function(req, res) {
  try {
    // Messages only. The project, testimonial and profile counts that
    // used to be here read tables the public site never touches, so the
    // dashboard reported numbers that could not change and did not
    // correspond to anything a visitor would see.
    var messages = await pool.query('SELECT COUNT(*) FROM messages');
    var unread = await pool.query('SELECT COUNT(*) FROM messages WHERE read=false');
    res.json({
      totalMessages: parseInt(messages.rows[0].count),
      unreadMessages: parseInt(unread.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== ANALYTICS =====
app.post('/api/pageview', pageviewLimiter, async function(req, res) {
  try {
    var { page } = req.body;
    var userAgent = req.headers['user-agent'] || '';
    var pageValue = (typeof page === 'string' && page ? page : '/').slice(0, 255);
    await pool.query(
      'INSERT INTO page_views (page, user_agent) VALUES ($1,$2)',
      [pageValue, userAgent]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.get('/api/admin/pageviews', auth, async function(req, res) {
  try {
    var today = await pool.query(
      "SELECT COUNT(*) FROM page_views WHERE created_at > NOW() - INTERVAL '1 day'"
    );
    var week = await pool.query(
      "SELECT COUNT(*) FROM page_views WHERE created_at > NOW() - INTERVAL '7 days'"
    );
    var month = await pool.query(
      "SELECT COUNT(*) FROM page_views WHERE created_at > NOW() - INTERVAL '30 days'"
    );
    var total = await pool.query('SELECT COUNT(*) FROM page_views');
    var perDay = await pool.query(
      // generate_series, not GROUP BY alone: grouping only returns days
      // that HAVE a view, so a month with five busy days came back as five
      // rows. The chart then drew five evenly spaced points and read as
      // five consecutive days of steady traffic - the quiet days simply
      // vanished instead of showing as the zeroes they are.
      "SELECT d.day::date AS date, COUNT(pv.id) AS count " +
      "FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') AS d(day) " +
      "LEFT JOIN page_views pv ON pv.created_at >= d.day AND pv.created_at < d.day + INTERVAL '1 day' " +
      "GROUP BY d.day ORDER BY d.day ASC"
    );
    var topPages = await pool.query(
      "SELECT page, COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY page ORDER BY count DESC LIMIT 5"
    );
    res.json({
      today: parseInt(today.rows[0].count),
      week: parseInt(week.rows[0].count),
      month: parseInt(month.rows[0].count),
      total: parseInt(total.rows[0].count),
      perDay: perDay.rows,
      topPages: topPages.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== SECURITY (admin) =====
app.get('/api/admin/security', auth, async function(req, res) {
  try {
    var last24h = await pool.query(
      "SELECT COUNT(*) FROM security_events WHERE created_at > NOW() - INTERVAL '24 hours'"
    );
    var topIps = await pool.query(
      "SELECT ip, COUNT(*) as count FROM security_events WHERE created_at > NOW() - INTERVAL '24 hours' GROUP BY ip ORDER BY count DESC LIMIT 10"
    );
    var recent = await pool.query(
      'SELECT ip, route, created_at FROM security_events ORDER BY created_at DESC LIMIT 50'
    );
    res.json({
      last24hCount: parseInt(last24h.rows[0].count),
      topIps: topIps.rows,
      recent: recent.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== ERROR HANDLING =====
// Catch-all for anything a route throws without handling itself.
app.use(function(err, req, res, next) {
  if (!err) return next();
  console.error('Unhandled request error:', err.message);
  res.status(400).json({ error: 'Request error' });
});

// ===== ANALYTICS RETENTION =====
// Pageview logs are anonymous (no IP, no cookie) but are still purged after
// 12 months to respect GDPR's storage limitation principle.
var PAGEVIEW_RETENTION_INTERVAL = 24 * 60 * 60 * 1000;
function cleanupOldPageviews() {
  pool.query("DELETE FROM page_views WHERE created_at < NOW() - INTERVAL '12 months'")
    .catch(function(err) { console.error('Pageview cleanup failed:', err.message); });
}

// ===== SECURITY EVENT RETENTION =====
// Unlike page_views, these rows do carry an IP address (needed to spot
// which client is misbehaving), so they're kept for a much shorter 30
// days rather than 12 months.
var SECURITY_EVENT_RETENTION_INTERVAL = 24 * 60 * 60 * 1000;
function cleanupOldSecurityEvents() {
  pool.query("DELETE FROM security_events WHERE created_at < NOW() - INTERVAL '30 days'")
    .catch(function(err) { console.error('Security event cleanup failed:', err.message); });
}

// ===== MESSAGE / TESTIMONIAL RETENTION =====
// Contact messages have no legitimate reason to live in the database
// forever (GDPR Art. 5(1)(e) storage limitation) - the site owner is
// notified by email when one arrives, so the DB row is just the admin
// panel's working copy, not the only record. Unpublished testimonials are
// the same story: once rejected or left unmoderated, there's no reason to
// keep them indefinitely either. Published testimonials (visible=true) are
// live site content, not transient submission data, so they're never
// touched here - only the owner deleting one, or a visitor's own removal
// request, should ever remove a published testimonial.
var MESSAGE_RETENTION_INTERVAL = 24 * 60 * 60 * 1000;
// Returns a Promise (unlike the fire-and-forget cleanups above) so tests can
// await it directly; the interval below still just calls it without awaiting,
// which is fine since each query still catches its own error internally.
function cleanupOldMessages() {
  return Promise.all([
    // Six months, and the privacy policy says six months. If one of
    // these two changes the other has to change with it - a retention
    // period is a promise, and this query is the only thing that keeps it.
    pool.query("DELETE FROM messages WHERE created_at < NOW() - INTERVAL '6 months'")
      .catch(function(err) { console.error('Message cleanup failed:', err.message); })
  ]);
}

// ===== MESSAGE DIGEST NOTIFICATIONS =====
// POST /api/messages and /api/testimonials/submit used to email on every
// single submission. The rate limit on those routes is per-IP (3/hour), so
// a botnet or a handful of proxies could each stay under it while still
// filling the inbox with hundreds of emails an hour - worst case, Resend's
// daily quota gets burned and real contact-form messages stop being
// deliverable. Batch instead: check periodically for anything new since the
// last digest and send at most one summary email, never one per submission.
var DIGEST_INTERVAL = 15 * 60 * 1000;
// In-memory only (not persisted across restarts). Starting the watermark at
// "now" seemed harmless at first - worst case, a restart delays the next
// notification by one interval - but that's wrong: WHERE created_at > $1
// means anything submitted *before* the watermark never matches, ever, once
// it's moved past. A message that arrives and then the process restarts
// before the next check is silently dropped forever, not just delayed.
// Starting further back instead means a restart can only ever cause a
// harmless duplicate notification (something already reported before the
// restart gets mentioned again), never a silently lost one.
var DIGEST_STARTUP_LOOKBACK = 24 * 60 * 60 * 1000;
var lastDigestNotifiedAt = new Date(Date.now() - DIGEST_STARTUP_LOOKBACK);

function sendDigestNotification() {
  var since = lastDigestNotifiedAt;
  var checkedAt = new Date();
  pool.query('SELECT COUNT(*) FROM messages WHERE created_at > $1', [since])
    .then(function(result) {
      var newMessages = parseInt(result.rows[0].count, 10);
      if (newMessages === 0) return;

      var summary = newMessages + ' new message' + (newMessages === 1 ? '' : 's');

      // Only advance the watermark once something is actually reported, so a
      // quiet period never causes a gap - the next check just looks further back.
      lastDigestNotifiedAt = checkedAt;

      // Deliberately generic - no submitted names/emails/message bodies here,
      // so this can't become a way to smuggle unescaped user input into an
      // email client. Anyone who wants details opens the admin panel.
      sendNotification(
        summary + ' — check the admin panel',
        '<h3>New activity on your site</h3><p>' + summary + ' since the last update. Open the admin panel to review.</p>'
      );
    })
    .catch(function(err) { console.error('Digest notification check failed:', err.message); });
}

// ===== START =====
// Guarded so requiring this file (e.g. from tests) doesn't also start a
// live server, register background intervals, or run cleanup queries.
if (require.main === module) {
  cleanupOldPageviews();
  setInterval(cleanupOldPageviews, PAGEVIEW_RETENTION_INTERVAL);
  cleanupOldSecurityEvents();
  setInterval(cleanupOldSecurityEvents, SECURITY_EVENT_RETENTION_INTERVAL);
  cleanupOldMessages();
  setInterval(cleanupOldMessages, MESSAGE_RETENTION_INTERVAL);
  sendDigestNotification();
  setInterval(sendDigestNotification, DIGEST_INTERVAL);

  app.listen(PORT, function() {
    console.log('Portfolio API running on http://localhost:' + PORT);
  });
}

// Exposed so tests can exercise the real retention query directly against a
// test database, instead of re-implementing (and possibly drifting from) the
// same SQL in the test file.
app.cleanupOldMessages = cleanupOldMessages;

module.exports = app;