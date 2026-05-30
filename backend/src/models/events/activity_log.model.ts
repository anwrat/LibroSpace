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
        HAVING SUM(al.user_xp_earned) > 0
        ORDER BY total_points DESC, u.name ASC
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
