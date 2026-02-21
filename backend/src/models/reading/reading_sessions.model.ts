import pool from "../../config/db.js";

export const checkforActiveSession = async(userId: number)=>{
    const result = await pool.query('SELECT id FROM reading.reading_sessions WHERE user_id=$1 and status=$2',[userId,'active']);
    return result.rows;
}

export const insertInReadingSession = async(user_id: number,book_id: number, start_page: number)=>{
    const result = await pool.query(`INSERT INTO reading.reading_sessions (user_id, book_id, start_page, status) VALUES ($1, $2, $3, 'active') RETURNING *`,[user_id, book_id, start_page]);
    return result.rows[0];
}

export const updateNotes = async(notes: string, session_id: number,user_id: number ) =>{
    const result = await pool.query('UPDATE reading.reading_sessions SET notes = $1 WHERE id = $2 AND user_id = $3',[notes, session_id, user_id]);
    return result;
}

export const endAndCalculateDuration = async(end_page:number, notes: string, session_id: number, user_id: number)=>{
    const result = await pool.query('UPDATE reading.reading_sessions SET end_time = CURRENT_TIMESTAMP, end_page = $1, notes = $2, status = $3, duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) WHERE id = $4 AND user_id = $5 RETURNING *',[end_page, notes, 'completed', session_id, user_id]);
    return result;
}

export const getSessionDetails=async(session_id: number, user_id: number)=>{
    const result = await pool.query(
            `SELECT rs.*, b.title as book_title 
             FROM reading.reading_sessions rs
             JOIN books.booklist b ON rs.book_id = b.id
             WHERE rs.id = $1 AND rs.user_id = $2`,
            [session_id, user_id]);
    return result;
}