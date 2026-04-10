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
    const result = await pool.query("SELECT q.id, q.content, q.page_number, b.title as book_title, b.author, b.cover_url FROM books.book_quotes q JOIN books.booklist b ON q.book_id = b.id WHERE q.book_id = $1", [book_id]);
    return result.rows;
};
