import pool from '../../config/db.js';

export const createUser = async (name: string, email: string, password: string)=>{
    const result = await pool.query('INSERT INTO auth.users (name, email, password) VALUES ($1,$2,$3) RETURNING *', [name, email, password]);
    return result.rows[0];
}

export const findUserByEmail = async (email:string) =>{
    const result = await pool.query('SELECT * FROM auth.users WHERE email = $1', [email]);
    return result.rows[0];
}

export const findUserByName = async (name:string) =>{
    const result = await pool.query('SELECT * FROM auth.users WHERE name = $1', [name]);
    return result.rows[0];
}

//A function to login by either email or name
export const loginByEmailorName = async (login:string) =>{
    const result = await pool.query('SELECT * FROM auth.users WHERE name = $1 OR email = $1', [login]);
    return result.rows[0];
}

//Creating google user after OAuth login
export const createGoogleUser = async (name: string, email: string, google_id:string, picture_url:string | null)=>{
    const result = await pool.query('INSERT INTO auth.users (name,email,google_id,picture_url) VALUES ($1,$2,$3,$4) RETURNING *',[name,email,google_id,picture_url]);
    return result.rows[0];
};

export const getAllUsers = async()=>{
    const result = await pool.query('SELECT id, name, email, created_at FROM auth.users WHERE role != $1',['admin']);
    return result.rows;
}

export const getUserGoalandStreakInfo = async(userId: number)=>{
    const result = await pool.query('SELECT daily_reading_goal, current_streak FROM auth.users WHERE id = $1',[userId]);
    return result.rows[0];
}

export const increaseStreak = async(userId: number) =>{
    const result = await pool.query('UPDATE auth.users SET current_streak = current_streak + 1 WHERE id = $1 RETURNING current_streak',[userId]);
    return result.rows[0].current_streak;
}

export const resetStreak = async(userId: number) =>{
    const result = await pool.query('UPDATE auth.users SET current_streak = 0 WHERE id = $1 RETURNING current_streak',[userId]);
    return result.rows[0].current_streak;
}

export const updateDailyGoal = async(userId: number, newGoal: number) =>{
    const result = await pool.query('UPDATE auth.users SET daily_reading_goal = $1 WHERE id = $2 RETURNING daily_reading_goal',[newGoal, userId]);
    return result.rows[0].daily_reading_goal;
}
