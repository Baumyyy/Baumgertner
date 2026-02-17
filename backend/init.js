var pool = require('./db');

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
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        tags TEXT[],
        status VARCHAR(50) DEFAULT 'Live',
        link VARCHAR(500),
        image VARCHAR(500),
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

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
        'baumgertnerr@outlook.com',
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
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDB();