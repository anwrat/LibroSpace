import pool from "../../config/db.js";

export const createFriendChallenge = async(challenger_id: number, challenged_id: number, challenge_type: string, goal_value: number, duration_days: number)=>{
    const result = await pool.query('INSERT INTO gamification.friend_challenges (challenger_id, challenged_id, challenge_type, goal_value, duration_days, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [challenger_id, challenged_id, challenge_type, goal_value, duration_days, 'pending']);
    return result.rows[0];
}

export const rejectChallenge = async(challengeId: number, userId: number)=>{
    const result = await pool.query('UPDATE gamification.friend_challenges SET status = \'rejected\' WHERE id = $1 AND challenged_id = $2 AND status = \'pending\' RETURNING *;', [challengeId, userId]);
    return result.rows[0]?.duration_days;
}

export const acceptChallenge = async(challengeId: number, userId: number,) => {
    const result = await pool.query("UPDATE gamification.friend_challenges SET status = 'active', start_date = NOW(), end_date = NOW() + (duration_days || ' days')::interval WHERE id = $1 AND challenged_id = $2 AND status = 'pending' RETURNING *;", [challengeId, userId]);
    return result.rows[0];
}

export const getUserChallenges = async(userId: number) =>{
    const result = await pool.query('SELECT * FROM gamification.friend_challenges WHERE challenger_id = $1 OR challenged_id = $1', [userId]);
    return result.rows;
}