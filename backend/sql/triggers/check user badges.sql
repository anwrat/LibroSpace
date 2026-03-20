CREATE OR REPLACE FUNCTION gamification.check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
    v_target_user_id INTEGER;
    v_total_time BIGINT;
    v_wins INTEGER;
    v_streak INTEGER;
    v_badge RECORD;
BEGIN
    -- 1. Identify the User ID based on the triggering table
    -- TG_TABLE_NAME is a built-in variable that tells us which table fired the trigger
    IF TG_TABLE_NAME = 'reading_sessions' THEN
        v_target_user_id := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'friend_challenges' THEN
        v_target_user_id := NEW.winner_id;
    END IF;

    -- Safety check: if we can't find a user ID, stop here
    IF v_target_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- 2. Gather Stats using the identified v_target_user_id
    SELECT COALESCE(SUM(duration_seconds), 0) INTO v_total_time 
    FROM reading.reading_sessions WHERE user_id = v_target_user_id;
    
    SELECT COUNT(*) INTO v_wins 
    FROM gamification.friend_challenges WHERE winner_id = v_target_user_id;

    SELECT current_streak INTO v_streak 
    FROM auth.users WHERE id = v_target_user_id;

    -- 3. Loop through badges the user DOES NOT have yet
    FOR v_badge IN 
        SELECT b.* FROM gamification.badges b
        WHERE b.id NOT IN (SELECT badge_id FROM gamification.user_badges WHERE user_id = v_target_user_id)
    LOOP
        -- Logic for Streak Badges
        IF v_badge.criteria_type = 'streak' AND v_streak >= v_badge.criteria_threshold THEN
            INSERT INTO gamification.user_badges (user_id, badge_id) VALUES (v_target_user_id, v_badge.id);
        
        -- Logic for Time Badges
        ELSIF v_badge.criteria_type = 'total_time' AND v_total_time >= v_badge.criteria_threshold THEN
            INSERT INTO gamification.user_badges (user_id, badge_id) VALUES (v_target_user_id, v_badge.id);

        -- Logic for Challenge Wins
        ELSIF v_badge.criteria_type = 'challenges_won' AND v_wins >= v_badge.criteria_threshold THEN
            INSERT INTO gamification.user_badges (user_id, badge_id) VALUES (v_target_user_id, v_badge.id);
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_badges_session ON reading.reading_sessions;
-- Trigger for Reading Sessions (Time/Streak badges)
CREATE TRIGGER trg_check_badges_session
AFTER UPDATE ON reading.reading_sessions
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION gamification.check_and_award_badges();

DROP TRIGGER IF EXISTS trg_check_badges_challenges ON gamification.friend_challenges;
-- Trigger for Challenges (Win badges)
CREATE TRIGGER trg_check_badges_challenges
AFTER UPDATE ON gamification.friend_challenges
FOR EACH ROW
WHEN (NEW.status = 'completed' AND NEW.winner_id IS NOT NULL)
EXECUTE FUNCTION gamification.check_and_award_badges();