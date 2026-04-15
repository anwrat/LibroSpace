import pool from "../../config/db.js";

export const newQuoteRequest = async(userId: number, bookId: number, text: string, pageNumber: number)=>{
    const newRequest = await pool.query(
            `INSERT INTO events.quote_requests (user_id, book_id, text, page_number) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [userId, bookId, text, pageNumber]
        );
    return newRequest.rows[0];
}

export const getQuoteRequestById = async(requestId: number) =>{
    const request = await pool.query(
            `SELECT qr.*, u.name as requester_name, b.title as book_title
             FROM events.quote_requests qr
             JOIN auth.users u ON qr.user_id = u.id
             JOIN books.booklist b ON qr.book_id = b.id
             WHERE qr.id = $1`,
            [requestId]
        );
    return request.rows[0];
}


export const approveQuoteRequest = async(requestId: number, book_id: number, text: string, pageNumber: number)=>{
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const newQuote = await client.query(
                `INSERT INTO books.book_quotes (book_id, content, page_number) 
                 VALUES ($1, $2, $3) RETURNING *`,
                [book_id, text, pageNumber]
        );
        const updateRequest = await client.query(
                `UPDATE events.quote_requests SET status = 'approved' WHERE id = $1 RETURNING *`,
                [requestId]
        );
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}