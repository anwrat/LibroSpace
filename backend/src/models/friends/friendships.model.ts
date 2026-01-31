import pool from "../../config/db.js";

export const getAllFriends = async(userId: number) =>{
    const result = await pool.query('SELECT id,name,email,picture_url FROM auth.users WHERE id IN (SELECT addressee_id FROM friends.friendships WHERE requester_id = $1 AND status = 1 UNION SELECT requester_id FROM friends.friendships WHERE addressee_id = $1 AND status = 1);');
    return result.rows;
}

export const createFriendRequest = async(requester_id: number, addressee_id: number) =>{
    const result = await pool.query('INSERT INTO friends.friendships (requester_id, addressee_id, status) SELECT $1, $2, 0 WHERE NOT EXISTS (SELECT 1 FROM friends.friendships WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)) RETURNING *;', [requester_id, addressee_id]);
    return result;
}