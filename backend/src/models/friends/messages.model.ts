import pool from "../../config/db.js";

export const saveMessage = async (senderId: number, receiverId: number, content: string) => {
    const result = await pool.query(
        `INSERT INTO friends.messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *`,
        [senderId, receiverId, content]
    );
    return result.rows[0];
}