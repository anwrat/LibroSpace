import pool from "../../config/db.js";

//There is a inset new activity log function in gamification service, so this file is not used for now, but we can keep it for future use if we want to log more specific activities that are not related to XP awarding

// export const logActivity = async(user_id: number, activity_type: string, xp_earned: number, is_community_contribution: boolean)=>{
//     const newlog = await pool.query(
//             `INSERT INTO events.activity_log (user_id, activity_type, xp_earned, is_community_contribution) 
//              VALUES ($1, $2, $3, $4) RETURNING *`,
//             [user_id, activity_type, xp_earned, is_community_contribution]
//         );
//     return newlog.rows[0];
// }