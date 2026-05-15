-- Skema Database untuk Vercel Postgres

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  npsn VARCHAR(20) UNIQUE NOT NULL,
  region VARCHAR(100),
  education_level VARCHAR(50),
  total_students INT,
  accreditation VARCHAR(5)
);

CREATE TABLE fund_allocations (
  id SERIAL PRIMARY KEY,
  school_id INT REFERENCES schools(id) ON DELETE CASCADE,
  year INT NOT NULL,
  total_received DECIMAL(15,2) DEFAULT 0,
  total_used DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fund_usages (
  id SERIAL PRIMARY KEY,
  allocation_id INT REFERENCES fund_allocations(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, 
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  usage_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  school_id INT REFERENCES schools(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  score INT CHECK (score >= 1 AND score <= 5),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
