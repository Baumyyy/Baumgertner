var pool = require('./db-admin');

var initDB = async function() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profile (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(200),
        bio TEXT,
        email VARCHAR(100),
        location VARCHAR(100),
        timezone VARCHAR(50),
        available BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW(),
        avatar VARCHAR(500)
      )
    `);
    await pool.query(`ALTER TABLE profile ADD COLUMN IF NOT EXISTS avatar VARCHAR(500)`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        tags TEXT[],
        status VARCHAR(50) DEFAULT 'Live',
        link VARCHAR(500),
        image VARCHAR(500),
        image_position VARCHAR(20) DEFAULT '50% 50%',
        image_zoom INTEGER DEFAULT 100,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_position VARCHAR(20) DEFAULT '50% 50%'`);
    await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_zoom INTEGER DEFAULT 100`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order)`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS security_events (
        id SERIAL PRIMARY KEY,
        ip VARCHAR(64) NOT NULL,
        route VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at)`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        company VARCHAR(255),
        message TEXT NOT NULL,
        avatar VARCHAR(500),
        rating INTEGER DEFAULT 5,
        visible BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        consent_at TIMESTAMP
      )
    `);
    // GDPR Art. 7(1) requires being able to demonstrate consent was given -
    // this records when the submitter checked the consent box, separately
    // from created_at (see the 400 rejection in server.js if it's missing).
    await pool.query(`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS consent_at TIMESTAMP`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_testimonials_visible_sort_order ON testimonials(visible, sort_order)`);

    // connect-pg-simple's session store - schema matches its own table.sql
    // exactly. Created here (as superuser) rather than left to the app's
    // createTableIfMissing, since the least-privilege app role has no DDL
    // rights; see least-privilege-role.sql.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")`);

    // Lisää oletusprofiili jos ei ole
    var profileCheck = await pool.query('SELECT COUNT(*) FROM profile');
    if (profileCheck.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO profile (name, role, bio, email, location, timezone, available)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'Anthony Baumgertner',
        'Software Engineer & Project Manager',
        'Student at Turku University of Applied Sciences',
        'contact@baumgertner.fi',
        'Turku, Finland',
        'EET (UTC +2)',
        true
      ]);
    }

    // Lisää oletusprojektit jos ei ole
    var projectCheck = await pool.query('SELECT COUNT(*) FROM projects');
    if (projectCheck.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO projects (title, description, tags, status, link, sort_order)
        VALUES 
          ($1, $2, $3, $4, $5, 1),
          ($6, $7, $8, $9, $10, 2),
          ($11, $12, $13, $14, $15, 3)
      `, [
        'Anthony.B Portfolio',
        'My personal portfolio website showcasing my projects and skills. Built from scratch with modern technologies.',
        '{React,Node.js,CSS3,HTML5}',
        'Live',
        'https://github.com/baumyyy/Baumgertner',
        'Customer Site Update',
        'Custom website update for a local business. Redesigned the frontend for better user experience and performance.',
        '{WordPress,CSS3,HTML5}',
        'Live',
        null,
        'This Could Be Your Project',
        'Contact me to collaborate on exciting projects! Always open to new ideas and challenges.',
        '{}',
        'Coming Soon',
        null
      ]);
    }

    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (err) {
    // 42501 = insufficient_privilege - the most common cause is running this
    // as the least-privilege portfolio_app role instead of a superuser.
    if (err.code === '42501') {
      console.error('Error initializing database: insufficient privileges to run CREATE/ALTER.');
      console.error('This must be run as a Postgres superuser, not the least-privilege app role (see backend/db/least-privilege-role.sql).');
      console.error('Set ADMIN_DB_USER/ADMIN_DB_PASSWORD to superuser credentials and re-run, e.g.:');
      console.error('  docker compose exec -e ADMIN_DB_USER=postgres -e ADMIN_DB_PASSWORD=<postgres_password> backend npm run init-db');
    } else {
      console.error('Error initializing database:', err);
    }
    process.exit(1);
  }
};

initDB();