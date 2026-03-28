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

export const getLatestSessionEndPage = async (user_id: number, book_id: number) => {
    const result = await pool.query(
        `SELECT end_page 
         FROM reading.reading_sessions 
         WHERE user_id = $1 AND book_id = $2 AND status = $3
         ORDER BY end_time DESC 
         LIMIT 1`,
        [user_id, book_id, 'completed']
    );
    // If a previous session exists, return end_page. If not, return null.
    return result.rows.length > 0 ? result.rows[0].end_page : null;
};

export const getAllUserSessions = async(user_id: number)=>{
    const result = await pool.query(
            `SELECT 
                rs.*, 
                b.title as book_title, 
                b.cover_url,
                b.author
             FROM reading.reading_sessions rs
             JOIN books.booklist b ON rs.book_id = b.id
             WHERE rs.user_id = $1
             ORDER BY rs.end_time DESC`,
            [user_id]
        );
    return result.rows;
}

export const getTotalReadingTimeToday = async(user_id: number, today: string)=>{
    const result = await pool.query('SELECT COALESCE(SUM(duration_seconds), 0) as total_time FROM reading.reading_sessions WHERE user_id = $1 AND DATE(end_time) = $2 AND status = $3',[user_id, today, 'completed']);
    return result.rows[0].total_time;
}

export const ReadingInsights = async(userId: number)=>{
        const query = `
            WITH dates AS (
                SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS day
            )
            SELECT 
                to_char(d.day, 'Dy') as label, -- 'Mon', 'Tue', etc.
                COALESCE(SUM(rs.duration_seconds), 0) / 60 as minutes,
                COALESCE(SUM(rs.end_page - rs.start_page), 0) as pages
            FROM dates d
            LEFT JOIN reading.reading_sessions rs ON DATE(rs.end_time) = d.day AND rs.user_id = $1
            GROUP BY d.day, d.day
            ORDER BY d.day ASC;
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
}