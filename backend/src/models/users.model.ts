import pool from '../config/db.js';

export interface User{
    id: number;
    name: string;
    email: string;
    password: string;
    created_at: Date;
}

export const createUser = async (name: string, email: string, password: string): Promise<User>=>{
    const result = await pool.query('INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *', [name, password, email]);
    return result.rows[0];
}

export const findUserByEmail = async (email:string): Promise<User> =>{
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
}
