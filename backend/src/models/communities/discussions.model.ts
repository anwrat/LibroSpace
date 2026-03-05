import pool from "../../config/db.js";

export const createDiscussion = async(community_id: number, user_id: number, title: string, content: string)=>{
    const result = await pool.query('INSERT INTO communities.discussions (community_id, user_id, title, content) VALUES ($1,$2,$3,$4) RETURNING *',[community_id, user_id, title, content]);
    return result.rows[0];
}