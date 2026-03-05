import pool from "../../config/db.js";

export const createDiscussion = async(community_id: number, user_id: number, title: string, content: string)=>{
    const result = await pool.query('INSERT INTO communities.discussions (community_id, user_id, title, content) VALUES ($1,$2,$3,$4) RETURNING *',[community_id, user_id, title, content]);
    return result.rows[0];
}

export const getDiscussionsByCommunityId = async(community_id: number)=>{
    const result = await pool.query('SELECT d.*, u.name as initiator, (SELECT COUNT(*) FROM communities.comments c WHERE c.discussion_id = d.id) as comment_count FROM communities.discussions d JOIN auth.users u ON d.user_id = u.id WHERE d.community_id = $1 ORDER BY d.created_at DESC', [community_id]);
    return result.rows;
}

export const getDiscussionById = async(discussion_id: number)=>{
    const result = await pool.query('SELECT d.*, u.name as initiator FROM communities.discussions d JOIN auth.users u ON d.user_id = u.id WHERE d.id = $1', [discussion_id]);
    return result.rows[0];
}