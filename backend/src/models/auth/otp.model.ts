import pool from "../../config/db.js";

export const saveOTP = async(email:string, otp: string, purpose: string)=>{
    await pool.query(`INSERT into auth.otp (email, otp, purpose, expires_at) VALUES ($1,$2,$3,NOW()+INTERVAL '10 minutes')`,[email,otp,purpose]);
}

export const verifyOTP = async(email: string, otp: string, purpose: string)=>{
    const res = await pool.query(`SELECT * FROM auth.otp WHERE email=$1 AND otp=$2 AND purpose=$3 AND expires_at > NOW()`,[email,otp,purpose]);
    return res.rows[0] ?? null;
}

export const deleteOTP = async(email:string, purpose:string)=>{
    await pool.query(`DELETE from auth.otp WHERE email=$1 AND purpose=$2`,[email,purpose]);
}