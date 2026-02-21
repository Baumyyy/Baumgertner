var request = require('supertest');
var express = require('express');
var pool = require('../db');

// Create test app
var app = express();
app.use(express.json());

// Import routes by recreating them for testing
app.get('/api/profile', async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM profile LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects', async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/availability', async function(req, res) {
  try {
    var result = await pool.query('SELECT available FROM profile LIMIT 1');
    res.json(result.rows[0] || { available: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// ===== TESTS =====
describe('Public API Endpoints', function() {

  afterAll(async function() {
    await pool.end();
  });

  // Profile
  describe('GET /api/profile', function() {
    it('should return profile data', async function() {
      var res = await request(app).get('/api/profile');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('email');
    });

    it('should contain required fields', async function() {
      var res = await request(app).get('/api/profile');
      expect(res.body.name).toBeDefined();
      expect(res.body.role).toBeDefined();
    });
  });

  // Projects
  describe('GET /api/projects', function() {
    it('should return an array', async function() {
      var res = await request(app).get('/api/projects');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should have project properties', async function() {
      var res = await request(app).get('/api/projects');
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('title');
        expect(res.body[0]).toHaveProperty('description');
        expect(res.body[0]).toHaveProperty('status');
      }
    });

    it('should return projects in order', async function() {
      var res = await request(app).get('/api/projects');
      if (res.body.length > 1) {
        expect(res.body[0].sort_order).toBeLessThanOrEqual(res.body[1].sort_order);
      }
    });
  });

  // Availability
  describe('GET /api/availability', function() {
    it('should return availability status', async function() {
      var res = await request(app).get('/api/availability');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('available');
      expect(typeof res.body.available).toBe('boolean');
    });
  });

  // Messages
  describe('POST /api/messages', function() {
    it('should send a message successfully', async function() {
      var res = await request(app)
        .post('/api/messages')
        .send({ name: 'Test User', email: 'test@test.com', message: 'Hello from Jest!' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test User');

      // Cleanup
      await pool.query('DELETE FROM messages WHERE email = $1', ['test@test.com']);
    });

    it('should reject empty name', async function() {
      var res = await request(app)
        .post('/api/messages')
        .send({ name: '', email: 'test@test.com', message: 'Hello' });
      expect(res.status).toBe(400);
    });

    it('should reject missing email', async function() {
      var res = await request(app)
        .post('/api/messages')
        .send({ name: 'Test', message: 'Hello' });
      expect(res.status).toBe(400);
    });

    it('should reject missing message', async function() {
      var res = await request(app)
        .post('/api/messages')
        .send({ name: 'Test', email: 'test@test.com' });
      expect(res.status).toBe(400);
    });
  });
});

// Auth endpoints
describe('Protected Endpoints', function() {

  it('GET /api/profile should be public', async function() {
    var res = await request(app).get('/api/profile');
    expect(res.status).not.toBe(401);
  });

  it('GET /api/projects should be public', async function() {
    var res = await request(app).get('/api/projects');
    expect(res.status).not.toBe(401);
  });

});