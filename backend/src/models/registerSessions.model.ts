import pool from "../config/db.js";
import {v4 as uuidv4} from 'uuid';

export const createRegisterSession = async(username: string, email: string, password:string) =>{
    const id = uuidv4();
    await pool.query(`INSERT INTO auth.register_sessions (id,name,email,password,expires_at) VALUES ($1,$2,$3,$4,NOW()+INTERVAL '10 minutes')`,[id,username,email,password]);
    return id;
}

export const findRegisterSession = async(id:string)=>{
    const res = await pool.query(`SELECT * FROM auth.register_sessions WHERE id = $1`,[id]);
    return res.rows[0];
}

export const deleteRegisterSession = async(id:string)=>{
    await pool.query(`DELETE FROM auth.register_sessions WHERE id = $1`,[id]);
}
