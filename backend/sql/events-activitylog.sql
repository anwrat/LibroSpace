CREATE TABLE events.activity_log (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(id),
    activity_type VARCHAR(50), -- 'FINISH_BOOK', 'SAVE_QUOTE', etc.
    user_xp_earned INT DEFAULT 0,
    community_xp_earned INT DEFAULT 0,
    is_community_contribution BOOLEAN DEFAULT false,
    community_id INT REFERENCES communities.communities(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);