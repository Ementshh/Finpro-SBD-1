const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Health/info endpoint so the deployment root doesn't 404 ("Cannot GET /")
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "finpro-backend",
    version: "1.0.1", // BERGUNA UNTUK CEK DEPLOYMENT UPDATE
    message: "Backend is running. Use /api/* endpoints.",
  });
});

// Common typo: users paste/visit a URL with a trailing apostrophe (e.g. /')
// Some clients will URL-encode it as /%27
app.get(["/%27", "/'"], (req, res) => {
  res.redirect(308, "/");
});

app.get("/api", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "finpro-backend",
    endpoints: {
      schools: "/api/schools",
      dashboard: "/api/funds/dashboard",
      reviews: {
        listBySchool: "/api/reviews/:school_id",
        create: "/api/reviews",
      },
      auth: {
        register: "/api/auth/register",
        login: "/api/auth/login",
      },
    },
  });
});

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Endpoint Get Schools
app.get("/api/schools", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.*,
        (SELECT COALESCE(AVG(score), 0) FROM reviews WHERE school_id = s.id) as average_rating,
        (SELECT COALESCE(SUM(total_received), 0) FROM fund_allocations WHERE school_id = s.id) as fund_allocation,
        (SELECT CASE 
            WHEN SUM(total_received) IS NULL OR SUM(total_received) = 0 THEN 0 
            ELSE (SUM(total_used) / SUM(total_received) * 100) 
          END FROM fund_allocations WHERE school_id = s.id) as fund_usage_percentage
      FROM schools s
      ORDER BY s.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint Dashboard
app.get("/api/funds/dashboard", async (req, res) => {
  try {
    const allocationResult = await db.query(
      "SELECT COALESCE(SUM(total_received), 0) as total, COALESCE(SUM(total_used), 0) as used FROM fund_allocations",
    );
    const categoryResult = await db.query(
      "SELECT category, COALESCE(SUM(amount), 0) as amount FROM fund_usages GROUP BY category",
    );

    res.json({
      summary: allocationResult.rows[0],
      categories: categoryResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint Reviews
app.get("/api/reviews/:school_id", async (req, res) => {
  const { school_id } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM reviews WHERE school_id = $1",
      [school_id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/reviews", async (req, res) => {
  const { school_id, user_id, score, comments } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO reviews (school_id, user_id, score, comments) VALUES ($1, $2, $3, $4) RETURNING *",
      [school_id, user_id, score, comments],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint Auth
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExist = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userExist.rows.length > 0)
      return res.status(400).json({ error: "Email sudah terdaftar" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, role || "user"],
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res.status(400).json({ error: "Email tidak ditemukan" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword)
      return res.status(400).json({ error: "Password salah" });

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/schools/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const schoolRes = await db.query(
      `
      SELECT
        s.*,
        COALESCE(AVG(r.score), 0) AS average_rating,
        COALESCE(SUM(fa.total_received), 0) AS fund_allocation,
        CASE
          WHEN COALESCE(SUM(fa.total_received), 0) = 0 THEN 0
          ELSE SUM(fa.total_used) / SUM(fa.total_received) * 100
        END AS fund_usage_percentage
      FROM schools s
      LEFT JOIN reviews r ON r.school_id = s.id
      LEFT JOIN fund_allocations fa ON fa.school_id = s.id
      WHERE s.id = $1
      GROUP BY s.id
    `,
      [id],
    );

    if (schoolRes.rows.length === 0)
      return res.status(404).json({ error: "School not found" });

    const categoriesRes = await db.query(
      `
      SELECT fu.category, COALESCE(SUM(fu.amount), 0) AS amount
      FROM fund_usages fu
      JOIN fund_allocations fa ON fu.allocation_id = fa.id
      WHERE fa.school_id = $1
      GROUP BY fu.category
    `,
      [id],
    );

    const historyRes = await db.query(
      `
      SELECT year, total_received AS allocated, total_used AS used
      FROM fund_allocations
      WHERE school_id = $1
      ORDER BY year ASC
    `,
      [id],
    );

    const reviewsRes = await db.query(
      `
      SELECT r.*, u.name AS author_name, u.role AS author_role
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.school_id = $1
      ORDER BY r.created_at DESC
      LIMIT 5
    `,
      [id],
    );

    res.json({
      ...schoolRes.rows[0],
      fundCategories: categoriesRes.rows,
      fundHistory: historyRes.rows,
      recentReviews: reviewsRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/schools", async (req, res) => {
  const { name, npsn, region, education_level, total_students, accreditation } =
    req.body;
  if (!name) return res.status(400).json({ error: "School name is required" });

  const finalNpsn =
    npsn || `AUTO${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 20);

  try {
    const result = await db.query(
      `INSERT INTO schools (name, npsn, region, education_level, total_students, accreditation)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        name,
        finalNpsn,
        region || null,
        education_level || null,
        total_students || null,
        accreditation || null,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "NPSN sudah terdaftar, gunakan NPSN lain" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/funds/usage", async (req, res) => {
  const { school_id, category, amount, description, date } = req.body;
  if (!school_id || !category || !amount || !date) {
    return res
      .status(400)
      .json({ error: "school_id, category, amount, and date are required" });
  }

  const year = new Date(date).getFullYear();

  try {
    let allocationRes = await db.query(
      "SELECT id FROM fund_allocations WHERE school_id = $1 AND year = $2 LIMIT 1",
      [school_id, year],
    );

    let allocationId;
    if (allocationRes.rows.length === 0) {
      const newAlloc = await db.query(
        "INSERT INTO fund_allocations (school_id, year, total_received, total_used) VALUES ($1, $2, 0, 0) RETURNING id",
        [school_id, year],
      );
      allocationId = newAlloc.rows[0].id;
    } else {
      allocationId = allocationRes.rows[0].id;
    }

    const usageResult = await db.query(
      `INSERT INTO fund_usages (allocation_id, category, amount, description, usage_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [allocationId, category, amount, description || null, date],
    );

    await db.query(
      "UPDATE fund_allocations SET total_used = total_used + $1 WHERE id = $2",
      [amount, allocationId],
    );

    res.status(201).json(usageResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/funds/allocation", async (req, res) => {
  const { school_id, amount, quarter, year, notes } = req.body;
  if (!school_id || !amount || !year) {
    return res
      .status(400)
      .json({ error: "school_id, amount, and year are required" });
  }

  try {
    const existing = await db.query(
      "SELECT id FROM fund_allocations WHERE school_id = $1 AND year = $2 LIMIT 1",
      [school_id, year],
    );

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        "UPDATE fund_allocations SET total_received = total_received + $1 WHERE id = $2 RETURNING *",
        [amount, existing.rows[0].id],
      );
    } else {
      result = await db.query(
        "INSERT INTO fund_allocations (school_id, year, total_received, total_used) VALUES ($1, $2, $3, 0) RETURNING *",
        [school_id, year, amount],
      );
    }

    res.status(201).json({
      ...result.rows[0],
      quarter: quarter || null,
      notes: notes || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Express jalan di port ${PORT}`);
});

module.exports = app;
