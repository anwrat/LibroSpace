import pool from "../../config/db.js";

export const getUserBadges = async (userId: number) => {
    const query = `
        SELECT b.name, b.description, b.icon_url, ub.earned_at
        FROM gamification.user_badges ub
        JOIN gamification.badges b ON ub.badge_id = b.id
        WHERE ub.user_id = $1
        ORDER BY ub.earned_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};