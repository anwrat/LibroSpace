import pool from "../../config/db.js";

export const logActivity = async(user_id: number, activity_type: string, xp_earned: number, is_community_contribution: boolean)=>{
    const newlog = await pool.query(
            `INSERT INTO events.activity_log (user_id, activity_type, xp_earned, is_community_contribution) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_id, activity_type, xp_earned, is_community_contribution]
        );
    return newlog.rows[0];
}