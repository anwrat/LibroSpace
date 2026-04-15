CREATE TABLE events.activity_log (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(id),
    activity_type VARCHAR(50), -- 'FINISH_BOOK', 'SAVE_QUOTE', etc.
    xp_earned INT,
    is_community_contribution BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);