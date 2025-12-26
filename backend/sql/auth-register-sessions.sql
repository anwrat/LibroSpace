CREATE TABLE auth.register_sessions (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
