-- 1. Definition of available badges
CREATE TABLE gamification.badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    criteria_type VARCHAR(50) NOT NULL, -- 'streak', 'challenges_won', 'total_time'
    criteria_threshold INTEGER NOT NULL,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Junction table for user achievements
CREATE TABLE gamification.user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES gamification.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id) -- Prevent duplicate badges
);