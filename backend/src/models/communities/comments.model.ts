import pool from "../../config/db.js";

export const addComment = async(discussion_id: number,user_id: number, content: string)=>{
    const result = await pool.query('INSERT INTO communities.comments (discussion_id, user_id, content) VALUES ($1,$2,$3) RETURNING *',[discussion_id, user_id, content]);
    return result.rows[0];
}

export const getCommentsbyDiscussionId = async(discussion_id: number)=>{
    const result = await pool.query('SELECT c.*, u.name as user, u.email as useremail, u.picture_url as userpfp FROM communities.comments c JOIN auth.users u ON c.user_id = u.id WHERE c.discussion_id = $1 ORDER BY c.created_at ASC', [discussion_id]);
    return result.rows;
}

export const deleteComment = async(comment_id: number)=>{
    await pool.query('DELETE FROM communities.comments WHERE id = $1', [comment_id]);
}