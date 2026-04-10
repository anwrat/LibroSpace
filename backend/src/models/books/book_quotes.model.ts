import pool from "../../config/db.js";

export const createBookQuote = async (book_id: number, quote: string, pageNumber: number) => {
  const result = await pool.query(
    "INSERT INTO books.book_quotes (book_id, content, page_number) VALUES ($1, $2, $3)",
    [book_id, quote, pageNumber]
  );
  return result.rows;
};

export const deleteBookQuote = async (quote_id: number) => {
  const result = await pool.query(
    "DELETE FROM books.book_quotes WHERE id = $1",
    [quote_id]
  );
  return result.rows;
};

export const getAllBookQuotes = async() =>{
    const result = await pool.query("SELECT q.id, q.content, q.page_number, b.title as book_title, b.author, b.cover_url FROM books.book_quotes q JOIN books.booklist b ON q.book_id = b.id");
    return result.rows;
}

export const getQuotesByBookId = async (book_id: number) => {
    const result = await pool.query("SELECT id, content, page_number FROM books.book_quotes WHERE book_id = $1", [book_id]);
    return result.rows;
};

export const checkIfQuoteSavedbyUser = async (user_id: number, quote_id: number) => {
    const result = await pool.query("SELECT id FROM books.saved_quotes WHERE user_id = $1 AND quote_id = $2", [user_id, quote_id]);
    return result;
}

export const deleteSavedQuote = async (user_id: number, quote_id: number) => {
    const result = await pool.query("DELETE FROM books.saved_quotes WHERE user_id = $1 AND quote_id = $2", [user_id, quote_id]);
    return result.rows;
}

export const saveQuoteForUser = async (user_id: number, quote_id: number) => {
    const result = await pool.query("INSERT INTO books.saved_quotes (user_id, quote_id) VALUES ($1, $2)", [user_id, quote_id]);
    return result.rows;
}

export const getSavedQuotesForUser = async (user_id: number) => {
    const result = await pool.query("SELECT q.id, q.content, q.page_number, b.title as book_title, b.author, b.cover_url FROM books.saved_quotes sq JOIN books.book_quotes q ON sq.quote_id = q.id JOIN books.booklist b ON q.book_id = b.id WHERE sq.user_id = $1", [user_id]);
    return result.rows;
}
