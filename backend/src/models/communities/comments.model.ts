import pool from "../../config/db.js";

export const addComment = async(discussion_id: number,user_id: number, content: string)=>{
    const result = await pool.query('INSERT INTO communities.comments (discussion_id, user_id, content) VALUES ($1,$2,$3) RETURNING *',[discussion_id, user_id, content]);
    return result.rows[0];
}