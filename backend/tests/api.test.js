var request = require('supertest');
var app = require('../server');
var pool = require('../db');

// Declared before 'Public API Endpoints' rather than after: that describe's
// afterAll closes the shared pool once its own tests finish, and Jest runs
// top-level describes in file order, so any block using `pool` has to come
// before it.
describe('Message retention', function() {
  it('purges messages past six months', async function() {
    await pool.query(
      "INSERT INTO messages (name, email, message, created_at) VALUES ($1,$2,$3, NOW() - INTERVAL '7 months')",
      ['Jest Old Message', 'jest-old-message@test.com', 'old message']
    );

    await app.cleanupOldMessages();

    var message = await pool.query('SELECT * FROM messages WHERE email = $1', ['jest-old-message@test.com']);
    expect(message.rows.length).toBe(0);
  });

  // The retention period is a promise the privacy policy makes in words
  // and this query keeps in fact. If they ever disagree, the policy is
  // wrong - so a message inside the window has to survive.
  it('keeps a message that is still inside the window', async function() {
    await pool.query(
      "INSERT INTO messages (name, email, message, created_at) VALUES ($1,$2,$3, NOW() - INTERVAL '5 months')",
      ['Jest Recent Message', 'jest-recent-message@test.com', 'recent message']
    );

    await app.cleanupOldMessages();

    var message = await pool.query('SELECT * FROM messages WHERE email = $1', ['jest-recent-message@test.com']);
    expect(message.rows.length).toBe(1);

    await pool.query('DELETE FROM messages WHERE email = $1', ['jest-recent-message@test.com']);
  });
});

// Placed before 'Public API Endpoints' for the same reason as the block
// above: that describe's afterAll closes the pool, and /api/health queries
// it.
describe('Health check', function() {
  it('answers 200 when the database is reachable', async function() {
    var res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  // The real bug this guards: docker-compose polled /api/profile, which was
  // deleted with the profile routes. The suite below even asserts that path
  // now 404s - the tests knew the route was gone while the thing that
  // depends on it did not. compose gates the frontend container on this
  // check, so a stale path means the next deploy hangs with the backend
  // stuck unhealthy and nothing serving the site.
  it('is the path docker-compose actually polls', function() {
    var fs = require('fs');
    var path = require('path');
    var compose = fs.readFileSync(path.join(__dirname, '..', '..', 'docker-compose.yml'), 'utf8');

    var osuma = compose.match(/http:\/\/localhost:3001(\/api\/[a-z0-9/-]*)/i);
    expect(osuma).not.toBeNull();
    expect(osuma[1]).toBe('/api/health');
  });
});

describe('Public API Endpoints', function() {

  afterAll(async function() {
    await pool.end();
  });

  describe('POST /api/messages', function() {
    // These cover validation, not the CAPTCHA, so they run with Turnstile
    // off. Without this they pass or fail depending on whether the machine
    // running them happens to have TURNSTILE_SECRET in its .env - which is
    // how 'should send a message successfully' came to fail locally while
    // the code it tests was fine. The CAPTCHA has its own describe below.
    var alkuperainenSecret = process.env.TURNSTILE_SECRET;

    beforeAll(function() { delete process.env.TURNSTILE_SECRET; });
    afterAll(function() {
      if (alkuperainenSecret !== undefined) process.env.TURNSTILE_SECRET = alkuperainenSecret;
    });

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

  // Every route wired up with the `auth` middleware must reject an
  // unauthenticated request with 401 - this is the actual security
  // boundary of the admin dashboard, so it must be exercised directly
  // rather than assumed from the public routes working.
  //
  // The list is short now because the site reads its content from the
  // repo: the project, testimonial, profile and upload routes were
  // removed along with the admin tabs that drove them, since nothing
  // public ever read the tables behind them.
  var protectedRoutes = [
    { method: 'get', path: '/api/messages' },
    { method: 'put', path: '/api/messages/1/read' },
    { method: 'delete', path: '/api/messages/1' },
    { method: 'get', path: '/api/admin/stats' },
    { method: 'get', path: '/api/admin/pageviews' },
    { method: 'get', path: '/api/admin/security' }
  ];

  protectedRoutes.forEach(function(route) {
    it(route.method.toUpperCase() + ' ' + route.path + ' should require authentication', async function() {
      var res = await request(app)[route.method](route.path);
      expect(res.status).toBe(401);
    });
  });

  // Routes that were removed should be gone, not quietly reachable.
  var removedRoutes = [
    { method: 'get', path: '/api/profile' },
    { method: 'put', path: '/api/profile' },
    { method: 'get', path: '/api/availability' },
    { method: 'get', path: '/api/projects' },
    { method: 'post', path: '/api/projects' },
    { method: 'get', path: '/api/testimonials' },
    { method: 'post', path: '/api/testimonials/submit' },
    { method: 'post', path: '/api/upload' },
    { method: 'post', path: '/api/upload-public' },
    { method: 'get', path: '/api/admin/analytics' }
  ];

  removedRoutes.forEach(function(route) {
    it(route.method.toUpperCase() + ' ' + route.path + ' should no longer exist', async function() {
      var res = await request(app)[route.method](route.path);
      expect(res.status).toBe(404);
    });
  });
});
