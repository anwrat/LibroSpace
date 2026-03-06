import pool from "../../config/db.js";

export const createCommunity = async (name: string, description: string, photo_url: string, created_by: number) =>{
    const result = await pool.query('INSERT INTO communities.communities (name, description, photo_url, created_by) VALUES ($1,$2,$3,$4) RETURNING *',[name,description,photo_url,created_by]);
    const assignMentor = await pool.query('INSERT INTO communities.community_members (community_id, user_id, role) VALUES ($1,$2,$3) RETURNING *',[result.rows[0].id, created_by, 'mentor']);
    return result.rows[0];
}

export const addMemberToCommunity = async(user_id: number, community_id: number) =>{
    const result = await pool.query('INSERT INTO communities.community_members (community_id, user_id, role) VALUES ($1,$2,$3) RETURNING *',[community_id, user_id, 'member']);
    return result.rows[0];
}

export const leaveCommunity = async(user_id: number, community_id: number) =>{
    const result = await pool.query('DELETE FROM communities.community_members WHERE user_id = $1 AND community_id = $2',[user_id, community_id]);
    return result.rows[0];
}

export const getAllCommunities = async () =>{
    const result = await pool.query('SELECT * FROM communities.communities');
    return result.rows;
}

export const joinedCommunities = async(user_id: number)=>{
    const result = await pool.query('SELECT c.*, cm.role FROM communities.communities c JOIN communities.community_members cm ON c.id = cm.community_id WHERE cm.user_id = $1',[user_id]);
    return result.rows;
}

export const getCommunitybyID = async(id: number) =>{
    const result = await pool.query('SELECT * FROM communities.communities WHERE id=$1',[id]);
    return result.rows[0];
}

export const isUserMember = async(user_id: number, community_id: number)=>{
    const result = await pool.query('SELECT * FROM communities.community_members WHERE user_id = $1 AND community_id = $2',[user_id, community_id]);
    return result.rows;
}