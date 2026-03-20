import pool from "../../config/db.js";

export const createFriendChallenge = async(challenger_id: number, challenged_id: number, challenge_type: string, goal_value: number, duration_days: number)=>{
    const result = await pool.query('INSERT INTO gamification.friend_challenges (challenger_id, challenged_id, challenge_type, goal_value, duration_days, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [challenger_id, challenged_id, challenge_type, goal_value, duration_days, 'pending']);
    return result.rows[0];
}

export const rejectChallenge = async(challengeId: number, userId: number)=>{
    const result = await pool.query('UPDATE gamification.friend_challenges SET status = \'rejected\' WHERE id = $1 AND challenged_id = $2 AND status = \'pending\' RETURNING *;', [challengeId, userId]);
    return result.rows[0]?.duration_days;
}

export const acceptChallenge = async (challengeId: number, userId: number) => {
    const query = `
        UPDATE gamification.friend_challenges 
        SET 
            status = 'active', 
            start_date = NOW(), 
            -- Safely multiply the integer by a 1-day interval
            end_date = NOW() + (duration_days * INTERVAL '1 day')
        WHERE id = $1 
        AND challenged_id = $2 
        AND status = 'pending' 
        RETURNING *;
    `;
    
    const result = await pool.query(query, [challengeId, userId]);
    return result.rows[0];
};

export const getUserChallenges = async (userId: number) => {
    // Auto-expire challenges that passed their end_date without a winner
    await pool.query(`
        UPDATE gamification.friend_challenges 
        SET status = 'completed', completed_at = NOW()
        WHERE status = 'active' 
        AND NOW() > end_date;
    `);

    // Fetch challenges with live progress and winner details
    const query = `
        SELECT 
            fc.*,
            u1.name AS challenger_name,
            u1.picture_url AS challenger_picture,
            u2.name AS challenged_name,
            u2.picture_url AS challenged_picture,
            u3.name AS winner_name, 
            
            -- Live Progress for Challenger
            CASE 
                WHEN fc.challenge_type = 'time' THEN 
                    COALESCE((
                        SELECT SUM(duration_seconds) 
                        FROM reading.reading_sessions 
                        WHERE user_id = fc.challenger_id 
                        AND end_time > fc.start_date 
                        AND end_time <= fc.end_date
                    ), 0)
                WHEN fc.challenge_type = 'pages' THEN 
                    COALESCE((
                        SELECT SUM(end_page - start_page) 
                        FROM reading.reading_sessions 
                        WHERE user_id = fc.challenger_id 
                        AND end_time > fc.start_date 
                        AND end_time <= fc.end_date
                    ), 0)
                ELSE 0 
            END AS challenger_progress,
            
            -- Live Progress for Challenged
            CASE 
                WHEN fc.challenge_type = 'time' THEN 
                    COALESCE((
                        SELECT SUM(duration_seconds) 
                        FROM reading.reading_sessions 
                        WHERE user_id = fc.challenged_id 
                        AND end_time > fc.start_date 
                        AND end_time <= fc.end_date
                    ), 0)
                WHEN fc.challenge_type = 'pages' THEN 
                    COALESCE((
                        SELECT SUM(end_page - start_page) 
                        FROM reading.reading_sessions 
                        WHERE user_id = fc.challenged_id 
                        AND end_time > fc.start_date 
                        AND end_time <= fc.end_date
                    ), 0)
                ELSE 0 
            END AS challenged_progress
        FROM gamification.friend_challenges fc
        LEFT JOIN auth.users u1 ON fc.challenger_id = u1.id
        LEFT JOIN auth.users u2 ON fc.challenged_id = u2.id
        LEFT JOIN auth.users u3 ON fc.winner_id = u3.id 
        WHERE fc.challenger_id = $1 OR fc.challenged_id = $1
        ORDER BY fc.created_at DESC;
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
};