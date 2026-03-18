CREATE TABLE gamification.friend_challenges (
    id SERIAL PRIMARY KEY,
    challenger_id INTEGER REFERENCES auth.users(id),
    challenged_id INTEGER REFERENCES auth.users(id),
    challenge_type VARCHAR(50), -- e.g., 'time', 'pages'
    goal_value INTEGER,         -- e.g., 300 (minutes) or 500 (pages)
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'rejected', 'completed'
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    winner_id INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_DATE,
    duration_days INTEGER NOT NULL DEFAULT 7,
    completed_at TIMESTAMP WITH TIME ZONE
);