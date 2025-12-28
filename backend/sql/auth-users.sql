CREATE TABLE auth.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255),              -- nullable for Google users
  google_id VARCHAR(255) UNIQUE,      -- only for Google OAuth
  picture_url TEXT,
  role VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
