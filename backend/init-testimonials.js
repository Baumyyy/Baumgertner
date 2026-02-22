var pool = require('./db');
require('dotenv').config();

async function init() {
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
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Testimonials table created!');

  await pool.query(`
    INSERT INTO testimonials (name, role, company, message, rating, sort_order) VALUES
    ('John Doe', 'CEO', 'TechCorp', 'Anthony is a talented developer with great project management skills. Highly recommended!', 5, 1),
    ('Jane Smith', 'Product Manager', 'StartupXYZ', 'Working with Anthony was a pleasure. He delivered on time and exceeded expectations.', 5, 2),
    ('Mike Johnson', 'Senior Developer', 'CodeLab', 'Great communication and solid technical skills. Anthony is a reliable team player.', 5, 3)
  `);
  console.log('Sample testimonials added!');
  process.exit(0);
}

init().catch(function(e) { console.error(e); process.exit(1); });