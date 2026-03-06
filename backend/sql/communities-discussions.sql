CREATE TABLE communities.discussions (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities.communities(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES auth.users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL, 
    created_at TIMESTAMP DEFAULT NOW()
);