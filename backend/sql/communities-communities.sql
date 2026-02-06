CREATE TABLE communities.communities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    photo_url TEXT,
    created_by INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);