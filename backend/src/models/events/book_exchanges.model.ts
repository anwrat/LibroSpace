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

export const getBooksListedForExchange = async() =>{
    const result = await pool.query("SELECT be.*, u.name as owner_name, u.picture_url as owner_picture FROM events.book_exchanges be JOIN auth.users u ON be.user_id = u.id WHERE be.status = $1 ORDER BY be.created_at DESC",['available']);
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

export const getSwapRequests = async (userId: number) => {
    // Fetch Received Requests (Someone wants your book)
    const received = await pool.query(`
        SELECT 
            er.*, 
            target_be.book_title as target_book_title, 
            target_be.image_url as target_book_image,
            sender_be.book_title as sender_book_title,
            sender_be.image_url as sender_book_image,
            u.name as sender_name, 
            u.picture_url as sender_picture
        FROM events.exchange_requests er
        JOIN events.book_exchanges target_be ON er.listing_id = target_be.id
        -- Join again to find the sender's current listing for the event
        LEFT JOIN events.book_exchanges sender_be ON er.sender_id = sender_be.user_id 
        JOIN auth.users u ON er.sender_id = u.id
        WHERE target_be.user_id = $1 AND er.status = 'pending'
        ORDER BY er.created_at DESC
    `, [userId]);

    // Fetch Sent Requests (You want someone else's book)
    const sent = await pool.query(`
        SELECT 
            er.*, 
            target_be.book_title as target_book_title, 
            target_be.image_url as target_book_image,
            sender_be.book_title as sender_book_title,
            sender_be.image_url as sender_book_image,
            u.name as owner_name, 
            target_be.location_city
        FROM events.exchange_requests er
        JOIN events.book_exchanges target_be ON er.listing_id = target_be.id
        LEFT JOIN events.book_exchanges sender_be ON er.sender_id = sender_be.user_id
        JOIN auth.users u ON target_be.user_id = u.id
        WHERE er.sender_id = $1 AND er.status = 'pending'
        ORDER BY er.created_at DESC
    `, [userId]);

    return { received: received.rows, sent: sent.rows };
}

export const getAcceptedSwaps = async (userId: number) => {
    const query = `
        SELECT 
            er.id,
            er.sender_id,
            er.receiver_id,
            er.status,
            er.created_at,
            er.listing_id as target_book_id,
            
            -- Receiver's book title (The one linked to the request)
            target_be.book_title as target_book_title,
            
            -- Fetch the sender's book ID and Title dynamically
            sender_be.id as sender_book_id,
            sender_be.book_title as sender_book_title,

            -- Determine the 'Partner' Name
            CASE 
                WHEN er.sender_id = $1 THEN r_user.name 
                ELSE s_user.name 
            END as partner_name,

            -- Determine the 'Partner' ID
            CASE 
                WHEN er.sender_id = $1 THEN er.receiver_id 
                ELSE er.sender_id 
            END as partner_id
        FROM events.exchange_requests er
        -- Join for the target book (linked to request)
        JOIN events.book_exchanges target_be ON er.listing_id = target_be.id
        -- Dynamic join: Find any 'available' book owned by the sender
        LEFT JOIN events.book_exchanges sender_be ON er.sender_id = sender_be.user_id AND sender_be.status = 'available'
        JOIN auth.users s_user ON er.sender_id = s_user.id
        JOIN auth.users r_user ON er.receiver_id = r_user.id
        WHERE (er.sender_id = $1 OR er.receiver_id = $1) 
        AND er.status = $2
        ORDER BY er.created_at DESC
    `;

    const result = await pool.query(query, [userId, 'accepted']);
    return result.rows;
}

export const updateSwapStatus = async(requestId: number, newStatus: string) =>{
    const result = await pool.query('UPDATE events.exchange_requests SET status = $1 WHERE id = $2 RETURNING *', [newStatus, requestId]);
    return result.rows[0];
}

export const setBookToSwappedAndRequestToCompleted = async (requestId: number) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Fetch the Request details to identify the Sender and the Target Book
        const requestResult = await client.query(
            'SELECT listing_id, sender_id FROM events.exchange_requests WHERE id = $1',
            [requestId]
        );

        if (requestResult.rows.length === 0) {
            throw new Error("Exchange request not found.");
        }

        const { listing_id: targetBookId, sender_id: senderId } = requestResult.rows[0];

        // 2. Find the Sender's book that is currently 'available'
        // Logic: The book that the sender listed for this exchange event
        const senderBookResult = await client.query(
            'SELECT id FROM events.book_exchanges WHERE user_id = $1 AND status = $2 LIMIT 1',
            [senderId, 'available']
        );

        const senderBookId = senderBookResult.rows[0]?.id;

        // 3. Update BOTH books to 'swapped'

        const bookIdsToUpdate = [targetBookId];
        if (senderBookId) {
            bookIdsToUpdate.push(senderBookId);
        }

        await client.query(
            'UPDATE events.book_exchanges SET status = $1 WHERE id = ANY($2)',
            ['swapped', bookIdsToUpdate]
        );

        // 4. Update the Exchange Request to 'completed'
        const res = await client.query(
            'UPDATE events.exchange_requests SET status = $1 WHERE id = $2 RETURNING *',
            ['completed', requestId]
        );

        await client.query('COMMIT');
        
        return res.rows[0]; 
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Transaction Error:", error);
        throw error;
    } finally {
        client.release();
    }
};