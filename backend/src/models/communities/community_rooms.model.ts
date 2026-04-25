import pool from "../../config/db.js";

export const getActiveRoomsByCommunityId = async(community_id: number)=>{
    const query = `SELECT *, b.title as book_title FROM communities.community_rooms cr JOIN books.booklist b ON cr.book_id = b.id WHERE cr.community_id = $1 AND cr.is_active = true`;
    const result = await pool.query(query, [community_id]);
    return result.rows;
}

export const startNewRoom = async(community_id: number, host_id: number, book_id: number)=>{
    const query = `INSERT INTO communities.community_rooms (community_id, host_id, book_id) VALUES ($1, $2, $3) RETURNING *`;
    const result = await pool.query(query, [community_id, host_id, book_id]);
    return result.rows[0];
}