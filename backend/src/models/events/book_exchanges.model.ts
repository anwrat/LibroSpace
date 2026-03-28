import pool from "../../config/db.js";

export const listBookForExchange = async(userId: number, book_title: string, book_author: string, condition: string, location_city: string, description: string, image_url: string) =>{
    const query = `
            INSERT INTO events.book_exchanges 
            (user_id, book_title, book_author, condition, location_city, description, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
    const result = await pool.query(query, [userId, book_title, book_author, condition, location_city, description, image_url]);
    return result.rows[0];
}

export const checkIfAlreadyJoined = async(userId: number)=>{
    const checkActive = await pool.query(
            'SELECT id FROM events.book_exchanges WHERE user_id = $1 AND status = $2',
            [userId, 'available']
    );
    return checkActive.rows;
}

export const getBooksListedForExchange = async(userId: number) =>{
    const result = await pool.query("SELECT be.*, u.name as owner_name, u.picture_url as owner_picture FROM events.book_exchanges be JOIN auth.users u ON be.user_id = u.id WHERE be.user_id != $1 AND be.status = $2 ORDER BY be.created_at DESC",[userId,'available']);
    return result.rows;
}

export const getReceiverId = async(listing_id: number) =>{
    const listing = await pool.query('SELECT user_id FROM events.book_exchanges WHERE id = $1', [listing_id]);
    return listing.rows[0]?.user_id || null;
}

export const createExchangeRequest = async(senderId: number, receiverId: number, listing_id: number)=>{
    const query = `
            INSERT INTO events.exchange_requests (sender_id, receiver_id, listing_id)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
    const exchange = await pool.query(query, [senderId, receiverId, listing_id]);
    return exchange.rows[0];
}

export const checkExistingRequest = async (senderId: number, listingId: number) => {
  const query = `
    SELECT id FROM events.exchange_requests 
    WHERE sender_id = $1 AND listing_id = $2 AND status = 'pending'
  `;
  const res = await pool.query(query, [senderId, listingId]);
  return res.rows.length > 0;
};

export const getSwapRequests = async(userId: number) =>{
    // Fetch Received Requests 
    const received = await pool.query(`
        SELECT er.*, be.book_title, be.image_url, u.name as sender_name, u.picture_url as sender_picture
        FROM events.exchange_requests er
        JOIN events.book_exchanges be ON er.listing_id = be.id
        JOIN auth.users u ON er.sender_id = u.id
        WHERE be.user_id = $1 AND er.status = 'pending'
        ORDER BY er.created_at DESC
    `, [userId]);

    // Fetch Sent Requests 
    const sent = await pool.query(`
        SELECT er.*, be.book_title, be.image_url, u.name as owner_name, be.location_city
        FROM events.exchange_requests er
        JOIN events.book_exchanges be ON er.listing_id = be.id
        JOIN auth.users u ON be.user_id = u.id
        WHERE er.sender_id = $1 AND er.status = 'pending'
        ORDER BY er.created_at DESC
    `, [userId]);
    return { received: received.rows, sent: sent.rows };
}