const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  /* Jika menggunakan Vercel Postgres, uncomment baris di bawah ini: */
  /* ssl: { rejectUnauthorized: false } */
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to Vercel Postgres/DB successfully!');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
