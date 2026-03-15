ALTER TABLE auth.users 
DROP COLUMN last_streak_date,
ADD COLUMN longest_streak INTEGER DEFAULT 0; 