import pool from "../../config/db.js";

export const saveMessage = async (senderId: number, receiverId: number, content: string) => {
    const result = await pool.query(
        `INSERT INTO friends.messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *`,
        [senderId, receiverId, content]
    );
    return result.rows[0];
}

export const getAllMessagesbetweenTwoUsers = async (userId: number, friendId: number) => {
    const result = await pool.query(
        `SELECT * FROM friends.messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at ASC`,
        [userId, friendId]
    );
    return result.rows;
}