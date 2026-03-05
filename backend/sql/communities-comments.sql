CREATE TABLE communities.comments (
    id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES communities.discussions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);