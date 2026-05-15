const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Endpoint Get Schools
app.get('/api/schools', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.*,
        COALESCE(AVG(r.score), 0) as average_rating,
        COALESCE(SUM(fa.total_received), 0) as fund_allocation,
        CASE 
          WHEN SUM(fa.total_received) = 0 THEN 0 
          ELSE (SUM(fa.total_used) / SUM(fa.total_received) * 100) 
        END as fund_usage_percentage
      FROM schools s
      LEFT JOIN reviews r ON s.id = r.school_id
      LEFT JOIN fund_allocations fa ON s.id = fa.school_id
      GROUP BY s.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint Dashboard
app.get('/api/funds/dashboard', async (req, res) => {
  try {
    const allocationResult = await db.query('SELECT SUM(total_received) as total, SUM(total_used) as used FROM fund_allocations');
    const categoryResult = await db.query('SELECT category, SUM(amount) as amount FROM fund_usages GROUP BY category');
    
    res.json({
      summary: allocationResult.rows[0],
      categories: categoryResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint Reviews
app.get('/api/reviews/:school_id', async (req, res) => {
  const { school_id } = req.params;
  try {
    const result = await db.query('SELECT * FROM reviews WHERE school_id = $1', [school_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  const { school_id, user_id, score, comments } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO reviews (school_id, user_id, score, comments) VALUES ($1, $2, $3, $4) RETURNING *',
      [school_id, user_id, score, comments]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint Auth
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExist = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) return res.status(400).json({ error: 'Email sudah terdaftar' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'user']
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(400).json({ error: 'Email tidak ditemukan' });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(400).json({ error: 'Password salah' });

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Express jalan di port ${PORT}`);
});
