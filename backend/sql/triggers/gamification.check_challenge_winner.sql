CREATE OR REPLACE FUNCTION gamification.check_challenge_winner()
RETURNS TRIGGER AS $$
DECLARE
    v_prev_progress BIGINT;
    v_total_calculated BIGINT;
    fc_record RECORD;
BEGIN 
    FOR fc_record IN 
        SELECT * FROM gamification.friend_challenges 
        WHERE LOWER(status) = 'active' 
        AND (challenger_id = NEW.user_id OR challenged_id = NEW.user_id)
    LOOP
        IF fc_record.challenge_type = 'time' THEN
            SELECT COALESCE(SUM(duration_seconds), 0) INTO v_prev_progress
            FROM reading.reading_sessions
            WHERE user_id = NEW.user_id 
              AND id != NEW.id
              AND end_time >= fc_record.start_date 
              AND end_time <= fc_record.end_date;

            v_total_calculated := v_prev_progress + COALESCE(NEW.duration_seconds, 0);

            IF v_total_calculated >= (fc_record.goal_value * 60) THEN
                UPDATE gamification.friend_challenges
                SET status = 'completed', winner_id = NEW.user_id, completed_at = NOW()
                WHERE id = fc_record.id;
            END IF;

        ELSIF fc_record.challenge_type = 'pages' THEN
            SELECT COALESCE(SUM(COALESCE(end_page, 0) - COALESCE(start_page, 0)), 0) 
            INTO v_prev_progress
            FROM reading.reading_sessions
            WHERE user_id = NEW.user_id 
              AND id != NEW.id
              AND end_time >= fc_record.start_date 
              AND end_time <= fc_record.end_date;

            v_total_calculated := v_prev_progress + (COALESCE(NEW.end_page, 0) - COALESCE(NEW.start_page, 0));

            IF v_total_calculated >= fc_record.goal_value THEN
                UPDATE gamification.friend_challenges
                SET status = 'completed', 
                    winner_id = NEW.user_id, 
                    completed_at = NOW()
                WHERE id = fc_record.id;
            END IF;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Drop the old Insert-only trigger
DROP TRIGGER IF EXISTS trg_after_reading_session ON reading.reading_sessions;

-- 2. Create a new trigger that fires on BOTH Insert and Update, because reading sessions first inserts active status to the db and then after ending updates it to completed
CREATE TRIGGER trg_after_reading_session
AFTER INSERT OR UPDATE ON reading.reading_sessions
FOR EACH ROW
-- Only run the logic if the session is being marked as completed
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION gamification.check_challenge_winner();