import pool from "../../config/db.js";

export const insertDailyGoalAchievement = async (user_id: number, achieved_date: string, time_read: number) => {
  const query = `
    INSERT INTO gamification.daily_goals_achieved (user_id, achieved_date, time_read) 
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, achieved_date) 
    DO UPDATE SET time_read = EXCLUDED.time_read
    RETURNING *;
  `;
  const result = await pool.query(query, [user_id, achieved_date, time_read]);
  return result.rows[0];
};

export const checkIfGoalAlreadyAchieved = async(user_id: number, achieved_date: string) => {
    const result = await pool.query('SELECT id FROM gamification.daily_goals_achieved WHERE user_id = $1 AND achieved_date = $2', [user_id, achieved_date]);
    return result.rows;
};

export const checkGoalMetYesterday = async(user_id: number, yesterday: string) =>{
    const result = await pool.query('SELECT * FROM gamification.daily_goals_achieved WHERE user_id = $1 AND achieved_date = $2',[user_id, yesterday]);
    return result.rows.length > 0; 
}

export const getDailyGoalsAchievedDateThisMonth = async (user_id: number) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JS months are 0-indexed

    // Format as YYYY-MM-DD manually to avoid ISO conversion shifts
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    const result = await pool.query(
        `SELECT achieved_date 
         FROM gamification.daily_goals_achieved 
         WHERE user_id = $1 
         AND achieved_date >= $2 
         AND achieved_date <= $3`,
        [user_id, start, end]
    );

    // Return an array of dates in YYYY-MM-DD format
    return result.rows.map((row: any) => {
        const d = new Date(row.achieved_date);
        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, '0'),
            String(d.getDate()).padStart(2, '0')
        ].join('-');
    });
}