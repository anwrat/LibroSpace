import pool from "../../config/db.js";

export const getTodaysLeaderboard = async () => {
    const query = `
        SELECT 
            u.id, 
            u.name, 
            u.picture_url,
            SUM(al.user_xp_earned) as total_points,
            COUNT(al.id) as total_activities
        FROM events.activity_log al
        JOIN auth.users u ON al.user_id = u.id
        WHERE al.created_at >= CURRENT_DATE 
          AND al.created_at < CURRENT_DATE + INTERVAL '1 day'
        GROUP BY u.id
        ORDER BY total_points DESC
        LIMIT 10;
    `;
    
    try {
        const { rows } = await pool.query(query);
        return rows;
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        throw err;
    }
};

//There is a inset new activity log function in gamification service, so this file is not used for now, but we can keep it for future use if we want to log more specific activities that are not related to XP awarding

// export const logActivity = async(user_id: number, activity_type: string, xp_earned: number, is_community_contribution: boolean)=>{
//     const newlog = await pool.query(
//             `INSERT INTO events.activity_log (user_id, activity_type, xp_earned, is_community_contribution) 
//              VALUES ($1, $2, $3, $4) RETURNING *`,
//             [user_id, activity_type, xp_earned, is_community_contribution]
//         );
//     return newlog.rows[0];
// }