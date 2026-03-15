CREATE TABLE gamification.daily_goals_achieved (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE,
    achieved_date DATE DEFAULT CURRENT_DATE,
    minutes_read INTEGER, -- The total minutes they had when they hit the goal
    UNIQUE(user_id, achieved_date)
);