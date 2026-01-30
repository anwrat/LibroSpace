import pool from "../../config/db.js";

export const addtoShelf = async(userId:number, bookId: number, shelf: string) =>{
    const startedAt = shelf == "currently_reading"?"NOW()":null;
    const result = await pool.query(
        "INSERT into books.user_shelves (user_id,book_id,shelf,started_at) VALUES ($1,$2,$3,$4) ON CONFLICT (user_id,book_id) DO UPDATE SET shelf = EXCLUDED.shelf, started_at = COALESCE(user_shelves.started_at,EXCLUDED.started_at) RETURNING *",[userId,bookId,shelf,startedAt]);
    return result.rows[0];
}

export const updateProgress = async(userId: number, bookId: number, progress: number) =>{
    return pool.query("UPDATE books.user_shelves SET progress = $1, started_at = CASE WHEN started_at IS NULL AND $1>0 THEN NOW() ELSE started_at END, finished_at = CASE WHEN $1 = 100 THEN NOW() ELSE finished_at END WHERE user_id = $2 AND book_id = $3 RETURNING *",[progress,userId,bookId]);
}

export const getUserShelves = async(userId: number) =>{
    const result = await pool.query("SELECT us.*,b.title,b.author,b.cover_url FROM books.user_shelves us JOIN books.booklist b ON b.id = us.book_id WHERE us.user_id = $1 ",[userId]);
    return result.rows;
}

export const checkIfBookInShelf = async(userId: number, bookId: number)=>{
    const result = await pool.query("SELECT * FROM books.user_shelves WHERE user_id = $1 AND book_id = $2",[userId,bookId]);
    return result.rows[0];
}