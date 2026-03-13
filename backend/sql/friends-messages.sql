CREATE TABLE friends.messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES auth.users(id),
    receiver_id INTEGER REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);