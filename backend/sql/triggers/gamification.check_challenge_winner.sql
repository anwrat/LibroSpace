CREATE OR REPLACE FUNCTION gamification.check_challenge_winner()
RETURNS TRIGGER AS $$
DECLARE
    v_prev_progress BIGINT;
    v_total_calculated BIGINT;
    fc_record RECORD;
BEGIN 
    -- Using EXPLICIT schema paths (gamification. and reading.)
    FOR fc_record IN 
        SELECT * FROM gamification.friend_challenges 
        WHERE LOWER(status) = 'active' 
        AND (challenger_id = NEW.user_id OR challenged_id = NEW.user_id)
        -- Commenting the date check because it was bugging, trade off is this will now sum every active challenge
        -- AND NEW.end_time >= (start_date - INTERVAL '1 minute') 
        -- AND NEW.end_time <= end_date
    LOOP
        IF fc_record.challenge_type = 'time' THEN
            SELECT COALESCE(SUM(duration_seconds), 0) INTO v_prev_progress
            FROM reading.reading_sessions
            WHERE user_id = NEW.user_id 
              AND id != NEW.id
              AND end_time >= fc_record.start_date 
              AND end_time <= fc_record.end_date;

            v_total_calculated := v_prev_progress + NEW.duration_seconds;

            IF v_total_calculated >= (fc_record.goal_value * 60) THEN
                UPDATE gamification.friend_challenges
                SET status = 'completed', 
                    winner_id = NEW.user_id, 
                    completed_at = NOW()
                WHERE id = fc_record.id;
            END IF;

        ELSIF fc_record.challenge_type = 'pages' THEN
            SELECT COALESCE(SUM(end_page - start_page), 0) INTO v_prev_progress
            FROM reading.reading_sessions
            WHERE user_id = NEW.user_id 
              AND id != NEW.id;

            v_total_calculated := v_prev_progress + (NEW.end_page - NEW.start_page);

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

DROP TRIGGER IF EXISTS trg_after_reading_session ON reading.reading_sessions;
CREATE TRIGGER trg_after_reading_session
AFTER INSERT ON reading.reading_sessions
FOR EACH ROW
EXECUTE FUNCTION gamification.check_challenge_winner();