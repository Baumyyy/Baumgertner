var express = require('express');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var pool = require('./db');
require('dotenv').config();

var app = express();
var PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ===== AUTH MIDDLEWARE =====
var auth = function(req, res, next) {
  var header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });

  try {
    var token = header.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ===== LOGIN =====
app.post('/api/login', function(req, res) {
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
    var { name, role, bio, email, location, timezone, available } = req.body;
    var result = await pool.query(
      'UPDATE profile SET name=$1, role=$2, bio=$3, email=$4, location=$5, timezone=$6, available=$7, updated_at=NOW() WHERE id=1 RETURNING *',
      [name, role, bio, email, location, timezone, available]
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
app.post('/api/messages', async function(req, res) {
  try {
    var { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }
    var result = await pool.query(
      'INSERT INTO messages (name, email, message) VALUES ($1,$2,$3) RETURNING *',
      [name, email, message]
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

// ===== DASHBOARD STATS (admin) =====
app.get('/api/admin/stats', auth, async function(req, res) {
  try {
    var projects = await pool.query('SELECT COUNT(*) FROM projects');
    var messages = await pool.query('SELECT COUNT(*) FROM messages');
    var unread = await pool.query('SELECT COUNT(*) FROM messages WHERE read=false');
    var profile = await pool.query('SELECT available FROM profile LIMIT 1');
    res.json({
      totalProjects: parseInt(projects.rows[0].count),
      totalMessages: parseInt(messages.rows[0].count),
      unreadMessages: parseInt(unread.rows[0].count),
      available: profile.rows[0] ? profile.rows[0].available : true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== START =====
app.listen(PORT, function() {
  console.log('Portfolio API running on http://localhost:' + PORT);
});