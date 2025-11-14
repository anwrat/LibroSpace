import pool from '../config/db.js';

export interface User{
    id: number;
    name: string;
    email: string;
    password: string;
    created_at: Date;
}

export const createUser = async (name: string, email: string, password: string): Promise<User>=>{
    const result = await pool.query('INSERT INTO auth.users (name, email, password) VALUES ($1,$2,$3) RETURNING *', [name, email, password]);
    return result.rows[0];
}

export const findUserByEmail = async (email:string): Promise<User> =>{
    const result = await pool.query('SELECT * FROM auth.users WHERE email = $1', [email]);
    return result.rows[0];
}

export const findUserByName = async (name:string): Promise<User> =>{
    const result = await pool.query('SELECT * FROM auth.users WHERE name = $1', [name]);
    return result.rows[0];
}

//A function to login by either email or name
export const loginByEmailorName = async (login:string): Promise<User> =>{
    const result = await pool.query('SELECT * FROM auth.users WHERE name = $1 OR email = $1', [login]);
    return result.rows[0];
}
