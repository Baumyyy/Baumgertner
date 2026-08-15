var request = require('supertest');
var app = require('../server');
var pool = require('../db');

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

    it('should reject an invalid email address', async function() {
      var res = await request(app)
        .post('/api/messages')
        .send({ name: 'Test', email: 'not-an-email', message: 'Hello' });
      expect(res.status).toBe(400);
    });

    it('should reject a field exceeding the max length', async function() {
      var res = await request(app)
        .post('/api/messages')
        .send({ name: 'x'.repeat(101), email: 'test@test.com', message: 'Hello' });
      expect(res.status).toBe(400);
    });

    it('should silently accept (and not store) a honeypot-triggered submission', async function() {
      var res = await request(app)
        .post('/api/messages')
        .send({ name: 'Bot', email: 'bot@test.com', message: 'Spam', website: 'http://spam.example' });
      expect(res.status).toBe(200);

      var check = await pool.query('SELECT * FROM messages WHERE email = $1', ['bot@test.com']);
      expect(check.rows.length).toBe(0);
    });
  });

  describe('POST /api/testimonials/submit', function() {
    it('should reject a submission without consent, and not store it', async function() {
      var res = await request(app)
        .post('/api/testimonials/submit')
        .send({ name: 'Jest No Consent', message: 'Great to work with!' });
      expect(res.status).toBe(400);

      var check = await pool.query('SELECT * FROM testimonials WHERE name = $1', ['Jest No Consent']);
      expect(check.rows.length).toBe(0);
    });

    it('should reject a submission where consent is not exactly true', async function() {
      var res = await request(app)
        .post('/api/testimonials/submit')
        .send({ name: 'Jest Falsy Consent', message: 'Great to work with!', consent: 'yes' });
      expect(res.status).toBe(400);

      var check = await pool.query('SELECT * FROM testimonials WHERE name = $1', ['Jest Falsy Consent']);
      expect(check.rows.length).toBe(0);
    });

    it('should accept a submission with consent and record consent_at', async function() {
      var res = await request(app)
        .post('/api/testimonials/submit')
        .send({ name: 'Jest With Consent', message: 'Great to work with!', consent: true });
      expect(res.status).toBe(200);

      var check = await pool.query('SELECT consent_at FROM testimonials WHERE name = $1', ['Jest With Consent']);
      expect(check.rows.length).toBe(1);
      expect(check.rows[0].consent_at).not.toBeNull();

      // Cleanup
      await pool.query('DELETE FROM testimonials WHERE name = $1', ['Jest With Consent']);
    });
  });

  // With TURNSTILE_SECRET unset (as in every test above), verifyTurnstile
  // fails open - these exercise the other side, where it's actually
  // enforced. siteverify is mocked rather than hitting Cloudflare for real.
  describe('Turnstile CAPTCHA verification (TURNSTILE_SECRET set)', function() {
    var originalSecret = process.env.TURNSTILE_SECRET;
    var originalFetch = global.fetch;

    beforeAll(function() {
      process.env.TURNSTILE_SECRET = 'test-secret';
    });

    afterEach(function() {
      global.fetch = originalFetch;
    });

    afterAll(function() {
      process.env.TURNSTILE_SECRET = originalSecret;
    });

    it('should reject a message with no Turnstile token, and not store it', async function() {
      var res = await request(app)
        .post('/api/messages')
        .send({ name: 'No Token', email: 'no-token@test.com', message: 'Hello' });
      expect(res.status).toBe(400);

      var check = await pool.query('SELECT * FROM messages WHERE email = $1', ['no-token@test.com']);
      expect(check.rows.length).toBe(0);
    });

    it('should reject a testimonial with no Turnstile token, and not store it', async function() {
      var res = await request(app)
        .post('/api/testimonials/submit')
        .send({ name: 'Jest No Token', message: 'Great to work with!', consent: true });
      expect(res.status).toBe(400);

      var check = await pool.query('SELECT * FROM testimonials WHERE name = $1', ['Jest No Token']);
      expect(check.rows.length).toBe(0);
    });

    it('should reject a message when siteverify reports the token invalid', async function() {
      global.fetch = jest.fn().mockResolvedValue({
        json: async function() { return { success: false }; }
      });
      var res = await request(app)
        .post('/api/messages')
        .send({ name: 'Bad Token', email: 'bad-token@test.com', message: 'Hello', turnstileToken: 'bad-token' });
      expect(res.status).toBe(400);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        expect.objectContaining({ method: 'POST' })
      );

      var check = await pool.query('SELECT * FROM messages WHERE email = $1', ['bad-token@test.com']);
      expect(check.rows.length).toBe(0);
    });

    it('should accept a message when siteverify confirms the token', async function() {
      global.fetch = jest.fn().mockResolvedValue({
        json: async function() { return { success: true }; }
      });
      var res = await request(app)
        .post('/api/messages')
        .send({ name: 'Good Token', email: 'good-token@test.com', message: 'Hello', turnstileToken: 'good-token' });
      expect(res.status).toBe(200);

      // Cleanup
      await pool.query('DELETE FROM messages WHERE email = $1', ['good-token@test.com']);
    });
  });
});

describe('Protected Endpoints', function() {

  it('GET /api/profile should be public', async function() {
    var res = await request(app).get('/api/profile');
    expect(res.status).not.toBe(401);
  });

  it('GET /api/projects should be public', async function() {
    var res = await request(app).get('/api/projects');
    expect(res.status).not.toBe(401);
  });

  // Every route wired up with the `auth` middleware must reject an
  // unauthenticated request with 401 - this is the actual security
  // boundary of the admin dashboard, so it must be exercised directly
  // rather than assumed from the public routes working.
  var protectedRoutes = [
    { method: 'put', path: '/api/profile' },
    { method: 'put', path: '/api/availability' },
    { method: 'post', path: '/api/projects' },
    { method: 'put', path: '/api/projects/1' },
    { method: 'delete', path: '/api/projects/1' },
    { method: 'get', path: '/api/messages' },
    { method: 'put', path: '/api/messages/1/read' },
    { method: 'delete', path: '/api/messages/1' },
    { method: 'get', path: '/api/admin/testimonials' },
    { method: 'post', path: '/api/testimonials' },
    { method: 'put', path: '/api/testimonials/1' },
    { method: 'delete', path: '/api/testimonials/1' },
    { method: 'post', path: '/api/upload' },
    { method: 'get', path: '/api/admin/stats' },
    { method: 'get', path: '/api/admin/analytics' },
    { method: 'get', path: '/api/admin/pageviews' },
    { method: 'get', path: '/api/admin/security' }
  ];

  protectedRoutes.forEach(function(route) {
    it(route.method.toUpperCase() + ' ' + route.path + ' should require authentication', async function() {
      var res = await request(app)[route.method](route.path);
      expect(res.status).toBe(401);
    });
  });
});
