var express = require('express');
var cors = require('cors');
var jwt = require('jsonwebtoken');
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

var app = express();
app.use(compression());
app.set('trust proxy', 1);
var PORT = process.env.PORT || 3001;

// Uploads folder
var uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, 'project-' + Date.now() + ext);
  }
});

var upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Email helper
var sendNotification = async function(subject, html) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_EMAIL) return;
  try {
    var resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
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

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

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
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
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
  var header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Not authenticated' });
  try {
    var token = header.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ===== GITHUB AUTH ROUTES =====
app.get('/api/auth/github', authLimiter, passport.authenticate('github', { scope: ['user:email'] }));

app.get('/api/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/admin?error=unauthorized' }),
  function(req, res) {
    res.redirect('http://localhost:5173/admin');
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
    res.redirect('http://localhost:5173/admin');
  });
});

// ===== JWT LOGIN (backup) =====
app.post('/api/login', authLimiter, function(req, res) {
  var { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    var token = jwt.sign({ user: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token: token });
  } else {
    res.status(401).json({ error: 'Wrong credentials' });
  }
});

// ===== PROFILE (public) =====
app.get('/api/profile', async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM profile LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PROFILE (admin) =====
app.put('/api/profile', auth, async function(req, res) {
  try {
    var { name, role, bio, email, location, timezone, available, avatar } = req.body;
    var result = await pool.query(
      'UPDATE profile SET name=$1, role=$2, bio=$3, email=$4, location=$5, timezone=$6, available=$7, avatar=$8, updated_at=NOW() WHERE id=1 RETURNING *',
      [name, role, bio, email, location, timezone, available, avatar]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== AVAILABILITY =====
app.get('/api/availability', async function(req, res) {
  try {
    var result = await pool.query('SELECT available FROM profile LIMIT 1');
    res.json(result.rows[0] || { available: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// ===== PROJECTS (public) =====
app.get('/api/projects', async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PROJECTS (admin) =====
app.post('/api/projects', auth, async function(req, res) {
  try {
    var { title, description, tags, status, link, image, sort_order } = req.body;
    var result = await pool.query(
      'INSERT INTO projects (title, description, tags, status, link, image, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [title, description, tags || '{}', status || 'Live', link, image, sort_order || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', auth, async function(req, res) {
  try {
    var { title, description, tags, status, link, image, sort_order } = req.body;
    var result = await pool.query(
      'UPDATE projects SET title=$1, description=$2, tags=$3, status=$4, link=$5, image=$6, sort_order=$7 WHERE id=$8 RETURNING *',
      [title, description, tags, status, link, image, sort_order, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', auth, async function(req, res) {
  try {
    await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MESSAGES (public: send) =====
app.post('/api/messages', messageLimiter, async function(req, res) {
  try {
    var { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }
    var result = await pool.query(
      'INSERT INTO messages (name, email, message) VALUES ($1,$2,$3) RETURNING *',
      [name, email, message]
    );

    sendNotification(
      'New message from ' + name,
      '<h3>New Contact Message</h3>' +
      '<p><strong>From:</strong> ' + name + '</p>' +
      '<p><strong>Email:</strong> ' + email + '</p>' +
      '<p><strong>Message:</strong></p>' +
      '<p>' + message + '</p>'
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MESSAGES (admin) =====
app.get('/api/messages', auth, async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/messages/:id', auth, async function(req, res) {
  try {
    await pool.query('DELETE FROM messages WHERE id=$1', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== TESTIMONIALS (public) =====
app.get('/api/testimonials', async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM testimonials WHERE visible=true ORDER BY sort_order ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/testimonials/submit', messageLimiter, async function(req, res) {
  try {
    var { name, role, company, message, rating, avatar } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }
    var result = await pool.query(
      'INSERT INTO testimonials (name, role, company, message, rating, avatar, visible, sort_order) VALUES ($1,$2,$3,$4,$5,$6,false,0) RETURNING *',
      [name, role || '', company || '', message, rating || 5, avatar || null]
    );

    sendNotification(
      'New testimonial from ' + name,
      '<h3>New Testimonial</h3>' +
      '<p><strong>From:</strong> ' + name + '</p>' +
      '<p><strong>Role:</strong> ' + (role || 'N/A') + '</p>' +
      '<p><strong>Company:</strong> ' + (company || 'N/A') + '</p>' +
      '<p><strong>Rating:</strong> ' + (rating || 5) + '/5</p>' +
      '<p><strong>Message:</strong></p>' +
      '<p>' + message + '</p>'
    );

    res.json({ success: true, message: 'Thank you! Your testimonial will be reviewed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== TESTIMONIALS (admin) =====
app.get('/api/admin/testimonials', auth, async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM testimonials ORDER BY sort_order ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/testimonials', auth, async function(req, res) {
  try {
    var { name, role, company, message, avatar, rating, visible, sort_order } = req.body;
    var result = await pool.query(
      'INSERT INTO testimonials (name, role, company, message, avatar, rating, visible, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, role, company, message, avatar, rating || 5, visible !== false, sort_order || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/testimonials/:id', auth, async function(req, res) {
  try {
    var { name, role, company, message, avatar, rating, visible, sort_order } = req.body;
    var result = await pool.query(
      'UPDATE testimonials SET name=$1, role=$2, company=$3, message=$4, avatar=$5, rating=$6, visible=$7, sort_order=$8 WHERE id=$9 RETURNING *',
      [name, role, company, message, avatar, rating, visible, sort_order, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/testimonials/:id', auth, async function(req, res) {
  try {
    await pool.query('DELETE FROM testimonials WHERE id=$1', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PUBLIC UPLOAD (testimonial avatars) =====
app.post('/api/upload-public', messageLimiter, upload.single('image'), async function(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    var filename = 'avatar-' + Date.now() + '.webp';
    var outputPath = path.join(uploadsDir, filename);
    await sharp(req.file.path)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 75 })
      .toFile(outputPath);
    fs.unlinkSync(req.file.path);
    res.json({ url: '/uploads/' + filename });
  } catch (err) {
    var imageUrl = '/uploads/' + req.file.filename;
    res.json({ url: imageUrl });
  }
});

// ===== UPLOAD (admin) =====
app.post('/api/upload', auth, upload.single('image'), async function(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    var filename = 'project-' + Date.now() + '.webp';
    var outputPath = path.join(uploadsDir, filename);
    await sharp(req.file.path)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    fs.unlinkSync(req.file.path);
    var imageUrl = '/uploads/' + filename;
    res.json({ url: imageUrl });
  } catch (err) {
    var imageUrl = '/uploads/' + req.file.filename;
    res.json({ url: imageUrl });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// ===== START =====
app.listen(PORT, function() {
  console.log('Portfolio API running on http://localhost:' + PORT);
});