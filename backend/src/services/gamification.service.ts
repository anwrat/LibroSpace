//have to make xp related things here

import pool from "../config/db.js";

export const increaseXPforUser = async(user_id: number, xp: number) =>{
    const updatedUser = await pool.query(
            `UPDATE auth.users SET xp = xp + $1 WHERE id = $2 RETURNING *`,
            [xp, user_id]
        );
    return updatedUser.rows[0];
}