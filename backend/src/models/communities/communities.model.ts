import pool from "../../config/db.js";

export const createCommunity = async (name: string, description: string, photo_url: string, created_by: number) =>{
    const result = await pool.query('INSERT INTO communities.communities (name, description, photo_url, created_by) VALUES ($1,$2,$3,$4) RETURNING *',[name,description,photo_url,created_by]);
    const assignMentor = await pool.query('INSERT INTO communities.community_members (community_id, user_id, role) VALUES ($1,$2,$3) RETURNING *',[result.rows[0].id, created_by, 'mentor']);
    return result.rows[0];
}

export const getAllCommunities = async () =>{
    const result = await pool.query('SELECT * FROM communities.communities');
    return result.rows;
}