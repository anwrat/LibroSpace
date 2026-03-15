ALTER TABLE auth.users 
ADD COLUMN daily_reading_goal INTEGER DEFAULT 30,
ADD COLUMN current_streak INTEGER DEFAULT 0,
ADD COLUMN last_streak_date DATE;