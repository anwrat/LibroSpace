import pool from "../../config/db.js";

export const insertDailyGoalAchievement = async(user_id: number, achieved_date: string, time_read: number) =>{
    const result = await pool.query('INSERT INTO gamification.daily_goals_achieved (user_id, achieved_date, time_read) VALUES ($1, $2, $3) RETURNING *',[user_id, achieved_date, time_read]);
    return result.rows[0];
}

export const checkGoalMetYesterday = async(user_id: number, yesterday: string) =>{
    const result = await pool.query('SELECT * FROM gamification.daily_goals_achieved WHERE user_id = $1 AND achieved_date = $2',[user_id, yesterday]);
    return result.rows.length > 0; 
}