var express = require('express');
var cors = require('cors');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var session = require('express-session');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var pool = require('./db');
var sharp = require('sharp');
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

// Uploads folder
var uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Deletes a previously uploaded file given its public "/uploads/xyz.webp" URL.
// Only ever touches files inside uploadsDir, and only if the URL isn't reused
// elsewhere, so replacing/removing an image doesn't leave the old file behind.
var deleteUploadedFile = function(url) {
  if (!url || typeof url !== 'string' || url.indexOf('/uploads/') !== 0) return;
  var filename = path.basename(url);
  var filePath = path.join(uploadsDir, filename);
  if (path.dirname(filePath) !== uploadsDir) return;
  fs.unlink(filePath, function() {});
};

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, 'project-' + Date.now() + ext);
  }
});

var ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

var upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function(req, file, cb) {
    if (ALLOWED_IMAGE_TYPES.indexOf(file.mimetype) === -1) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Input validation helpers
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var isValidLength = function(str, max) {
  return typeof str === 'string' && str.length > 0 && str.length <= max;
};
var UPLOAD_PATH_REGEX = /^\/uploads\/[a-zA-Z0-9_.-]+$/;
var isValidUploadPath = function(url) {
  return url == null || url === '' || UPLOAD_PATH_REGEX.test(url);
};
var isValidExternalLink = function(url) {
  if (url == null || url === '') return true;
  try {
    var parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
var IMAGE_POSITION_REGEX = /^(100|[1-9]?[0-9])% (100|[1-9]?[0-9])%$/;
var isValidImagePosition = function(pos) {
  return pos == null || pos === '' || IMAGE_POSITION_REGEX.test(pos);
};
var isValidImageZoom = function(zoom) {
  if (zoom == null || zoom === '') return true;
  var n = Number(zoom);
  return Number.isInteger(n) && n >= 50 && n <= 300;
};

// Email helper
var escapeHtml = function(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
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

var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, try again later' }
});

var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many login attempts, try again later' }
});

var messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages, try again later' }
});

var pageviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, try again later' }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use('/api', apiLimiter);

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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

app.get('/api/auth/logout', function(req, res) {
  req.logout(function() {
    res.redirect(FRONTEND_URL + '/baumi-dashboard');
  });
});

// ===== PROFILE (public) =====
app.get('/api/profile', async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM profile LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== PROFILE (admin) =====
app.put('/api/profile', auth, async function(req, res) {
  try {
    var { name, role, bio, email, location, timezone, available, avatar } = req.body;
    if (!isValidUploadPath(avatar)) {
      return res.status(400).json({ error: 'Invalid avatar path' });
    }
    var existing = await pool.query('SELECT avatar FROM profile WHERE id=1');
    var result = await pool.query(
      'UPDATE profile SET name=$1, role=$2, bio=$3, email=$4, location=$5, timezone=$6, available=$7, avatar=$8, updated_at=NOW() WHERE id=1 RETURNING *',
      [name, role, bio, email, location, timezone, available, avatar]
    );
    var oldAvatar = existing.rows[0] && existing.rows[0].avatar;
    if (oldAvatar && oldAvatar !== avatar) deleteUploadedFile(oldAvatar);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== AVAILABILITY =====
app.get('/api/availability', async function(req, res) {
  try {
    var result = await pool.query('SELECT available FROM profile LIMIT 1');
    res.json(result.rows[0] || { available: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.put('/api/availability', auth, async function(req, res) {
  try {
    var { available } = req.body;
    var result = await pool.query(
      'UPDATE profile SET available=$1, updated_at=NOW() WHERE id=1 RETURNING available',
      [available]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== PROJECTS (public) =====
app.get('/api/projects', async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== PROJECTS (admin) =====
app.post('/api/projects', auth, async function(req, res) {
  try {
    var { title, description, tags, status, link, image, image_position, image_zoom, sort_order } = req.body;
    if (!isValidUploadPath(image)) {
      return res.status(400).json({ error: 'Invalid image path' });
    }
    if (!isValidExternalLink(link)) {
      return res.status(400).json({ error: 'Invalid project link' });
    }
    if (!isValidImagePosition(image_position)) {
      return res.status(400).json({ error: 'Invalid image position' });
    }
    if (!isValidImageZoom(image_zoom)) {
      return res.status(400).json({ error: 'Invalid image zoom' });
    }
    var result = await pool.query(
      'INSERT INTO projects (title, description, tags, status, link, image, image_position, image_zoom, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [title, description, tags || '{}', status || 'Live', link, image, image_position || '50% 50%', image_zoom || 100, sort_order || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.put('/api/projects/:id', auth, async function(req, res) {
  try {
    var { title, description, tags, status, link, image, image_position, image_zoom, sort_order } = req.body;
    if (!isValidUploadPath(image)) {
      return res.status(400).json({ error: 'Invalid image path' });
    }
    if (!isValidExternalLink(link)) {
      return res.status(400).json({ error: 'Invalid project link' });
    }
    if (!isValidImagePosition(image_position)) {
      return res.status(400).json({ error: 'Invalid image position' });
    }
    if (!isValidImageZoom(image_zoom)) {
      return res.status(400).json({ error: 'Invalid image zoom' });
    }
    var existing = await pool.query('SELECT image FROM projects WHERE id=$1', [req.params.id]);
    var result = await pool.query(
      'UPDATE projects SET title=$1, description=$2, tags=$3, status=$4, link=$5, image=$6, image_position=$7, image_zoom=$8, sort_order=$9 WHERE id=$10 RETURNING *',
      [title, description, tags, status, link, image, image_position || '50% 50%', image_zoom || 100, sort_order, req.params.id]
    );
    var oldImage = existing.rows[0] && existing.rows[0].image;
    if (oldImage && oldImage !== image) deleteUploadedFile(oldImage);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.delete('/api/projects/:id', auth, async function(req, res) {
  try {
    var existing = await pool.query('SELECT image FROM projects WHERE id=$1', [req.params.id]);
    await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
    if (existing.rows[0] && existing.rows[0].image) deleteUploadedFile(existing.rows[0].image);
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== MESSAGES (public: send) =====
app.post('/api/messages', messageLimiter, async function(req, res) {
  try {
    var { name, email, message, website } = req.body;
    if (website) {
      return res.json({ id: 0, name: name, email: email, message: message });
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

    sendNotification(
      'New message from ' + escapeHtml(name),
      '<h3>New Contact Message</h3>' +
      '<p><strong>From:</strong> ' + escapeHtml(name) + '</p>' +
      '<p><strong>Email:</strong> ' + escapeHtml(email) + '</p>' +
      '<p><strong>Message:</strong></p>' +
      '<p>' + escapeHtml(message) + '</p>'
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== MESSAGES (admin) =====
app.get('/api/messages', auth, async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
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

// ===== TESTIMONIALS (public) =====
app.get('/api/testimonials', async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM testimonials WHERE visible=true ORDER BY sort_order ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.post('/api/testimonials/submit', messageLimiter, async function(req, res) {
  try {
    var { name, role, company, message, rating, avatar, website } = req.body;
    if (website) {
      return res.json({ success: true, message: 'Thank you! Your testimonial will be reviewed.' });
    }
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }
    if (!isValidLength(name, 100) || !isValidLength(message, 2000) ||
        (role && !isValidLength(role, 100)) || (company && !isValidLength(company, 100)) ||
        (avatar && !isValidLength(avatar, 500))) {
      return res.status(400).json({ error: 'One or more fields exceed the maximum length' });
    }
    if (!isValidUploadPath(avatar)) {
      return res.status(400).json({ error: 'Invalid avatar path' });
    }
    var ratingNum = rating === undefined ? 5 : parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    await pool.query(
      'INSERT INTO testimonials (name, role, company, message, rating, avatar, visible, sort_order) VALUES ($1,$2,$3,$4,$5,$6,false,0) RETURNING *',
      [name, role || '', company || '', message, ratingNum, avatar || null]
    );

    sendNotification(
      'New testimonial from ' + escapeHtml(name),
      '<h3>New Testimonial</h3>' +
      '<p><strong>From:</strong> ' + escapeHtml(name) + '</p>' +
      '<p><strong>Role:</strong> ' + escapeHtml(role || 'N/A') + '</p>' +
      '<p><strong>Company:</strong> ' + escapeHtml(company || 'N/A') + '</p>' +
      '<p><strong>Rating:</strong> ' + ratingNum + '/5</p>' +
      '<p><strong>Message:</strong></p>' +
      '<p>' + escapeHtml(message) + '</p>'
    );

    res.json({ success: true, message: 'Thank you! Your testimonial will be reviewed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== TESTIMONIALS (admin) =====
app.get('/api/admin/testimonials', auth, async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM testimonials ORDER BY sort_order ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.post('/api/testimonials', auth, async function(req, res) {
  try {
    var { name, role, company, message, avatar, rating, visible, sort_order } = req.body;
    if (!isValidUploadPath(avatar)) {
      return res.status(400).json({ error: 'Invalid avatar path' });
    }
    var result = await pool.query(
      'INSERT INTO testimonials (name, role, company, message, avatar, rating, visible, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, role, company, message, avatar, rating || 5, visible !== false, sort_order || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.put('/api/testimonials/:id', auth, async function(req, res) {
  try {
    var { name, role, company, message, avatar, rating, visible, sort_order } = req.body;
    if (!isValidUploadPath(avatar)) {
      return res.status(400).json({ error: 'Invalid avatar path' });
    }
    var existing = await pool.query('SELECT avatar FROM testimonials WHERE id=$1', [req.params.id]);
    var result = await pool.query(
      'UPDATE testimonials SET name=$1, role=$2, company=$3, message=$4, avatar=$5, rating=$6, visible=$7, sort_order=$8 WHERE id=$9 RETURNING *',
      [name, role, company, message, avatar, rating, visible, sort_order, req.params.id]
    );
    var oldAvatar = existing.rows[0] && existing.rows[0].avatar;
    if (oldAvatar && oldAvatar !== avatar) deleteUploadedFile(oldAvatar);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.delete('/api/testimonials/:id', auth, async function(req, res) {
  try {
    var existing = await pool.query('SELECT avatar FROM testimonials WHERE id=$1', [req.params.id]);
    await pool.query('DELETE FROM testimonials WHERE id=$1', [req.params.id]);
    if (existing.rows[0] && existing.rows[0].avatar) deleteUploadedFile(existing.rows[0].avatar);
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== PUBLIC UPLOAD (testimonial avatars) =====
app.post('/api/upload-public', messageLimiter, upload.single('image'), async function(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    var filename = 'avatar-' + Date.now() + '.webp';
    var outputPath = path.join(uploadsDir, filename);
    await sharp(req.file.path, { limitInputPixels: 30000000 })
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 75 })
      .toFile(outputPath);
    fs.unlink(req.file.path, function() {});
    res.json({ url: '/uploads/' + filename });
  } catch (err) {
    console.error('Image processing failed:', err.message);
    fs.unlink(req.file.path, function() {});
    res.status(400).json({ error: 'Invalid image file' });
  }
});

// ===== UPLOAD (admin) =====
app.post('/api/upload', auth, upload.single('image'), async function(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    var filename = 'project-' + Date.now() + '.webp';
    var outputPath = path.join(uploadsDir, filename);
    await sharp(req.file.path, { limitInputPixels: 30000000 })
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    fs.unlink(req.file.path, function() {});
    res.json({ url: '/uploads/' + filename });
  } catch (err) {
    console.error('Image processing failed:', err.message);
    fs.unlink(req.file.path, function() {});
    res.status(400).json({ error: 'Invalid image file' });
  }
});

// ===== DASHBOARD STATS (admin) =====
app.get('/api/admin/stats', auth, async function(req, res) {
  try {
    var projects = await pool.query('SELECT COUNT(*) FROM projects');
    var messages = await pool.query('SELECT COUNT(*) FROM messages');
    var unread = await pool.query('SELECT COUNT(*) FROM messages WHERE read=false');
    var profile = await pool.query('SELECT available FROM profile LIMIT 1');
    var testimonials = await pool.query('SELECT COUNT(*) FROM testimonials');
    var pendingTestimonials = await pool.query('SELECT COUNT(*) FROM testimonials WHERE visible=false');
    res.json({
      totalProjects: parseInt(projects.rows[0].count),
      totalMessages: parseInt(messages.rows[0].count),
      unreadMessages: parseInt(unread.rows[0].count),
      totalTestimonials: parseInt(testimonials.rows[0].count),
      pendingTestimonials: parseInt(pendingTestimonials.rows[0].count),
      available: profile.rows[0] ? profile.rows[0].available : true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// ===== DASHBOARD ANALYTICS =====
app.get('/api/admin/analytics', auth, async function(req, res) {
  try {
    var messagesPerDay = await pool.query(
      "SELECT DATE(created_at) as date, COUNT(*) as count FROM messages WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date ASC"
    );
    var testimonialsByStatus = await pool.query(
      "SELECT visible, COUNT(*) as count FROM testimonials GROUP BY visible"
    );
    res.json({
      messagesPerDay: messagesPerDay.rows,
      testimonialsByStatus: testimonialsByStatus.rows
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
    var referrer = req.headers['referer'] || '';
    await pool.query(
      'INSERT INTO page_views (page, referrer, user_agent) VALUES ($1,$2,$3)',
      [page || '/', referrer, userAgent]
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
      "SELECT DATE(created_at) as date, COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date ASC"
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

// ===== ERROR HANDLING (e.g. multer file-type/size rejections) =====
app.use(function(err, req, res, next) {
  if (err) {
    return res.status(400).json({ error: err.message || 'Request error' });
  }
  next();
});

// ===== ANALYTICS RETENTION =====
// Pageview logs are anonymous (no IP, no cookie) but are still purged after
// 12 months to respect GDPR's storage limitation principle.
var PAGEVIEW_RETENTION_INTERVAL = 24 * 60 * 60 * 1000;
function cleanupOldPageviews() {
  pool.query("DELETE FROM page_views WHERE created_at < NOW() - INTERVAL '12 months'")
    .catch(function(err) { console.error('Pageview cleanup failed:', err.message); });
}
cleanupOldPageviews();
setInterval(cleanupOldPageviews, PAGEVIEW_RETENTION_INTERVAL);

// ===== UPLOAD RETENTION =====
// Safety net for files that end up unreferenced (e.g. a testimonial photo
// uploaded but the form was never submitted). Only removes files older than
// 24h so an upload mid-flow is never deleted out from under a pending submit.
var UPLOAD_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;
function cleanupOrphanedUploads() {
  Promise.all([
    pool.query('SELECT image AS url FROM projects WHERE image IS NOT NULL'),
    pool.query('SELECT avatar AS url FROM testimonials WHERE avatar IS NOT NULL'),
    pool.query('SELECT avatar AS url FROM profile WHERE avatar IS NOT NULL')
  ]).then(function(results) {
    var referenced = new Set();
    results.forEach(function(r) {
      r.rows.forEach(function(row) { referenced.add(path.basename(row.url)); });
    });
    fs.readdir(uploadsDir, function(err, files) {
      if (err) return;
      var cutoff = Date.now() - 24 * 60 * 60 * 1000;
      files.forEach(function(file) {
        if (referenced.has(file)) return;
        var filePath = path.join(uploadsDir, file);
        fs.stat(filePath, function(statErr, stats) {
          if (statErr || stats.mtimeMs > cutoff) return;
          fs.unlink(filePath, function() {});
        });
      });
    });
  }).catch(function(err) { console.error('Upload cleanup failed:', err.message); });
}
cleanupOrphanedUploads();
setInterval(cleanupOrphanedUploads, UPLOAD_CLEANUP_INTERVAL);

// ===== START =====
app.listen(PORT, function() {
  console.log('Portfolio API running on http://localhost:' + PORT);
});