import pool from "../../config/db.js";

// Helper to create a book and link genres
export const createBook = async (
    title: string, 
    author: string, 
    description: string, 
    cover_url: string, 
    published_date: string, 
    pageCount: number, 
    created_by: number,
    genreIds: number[] 
) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert the book
        const bookResult = await client.query(
            'INSERT INTO books.booklist (title, author, description, cover_url, published_date, pagecount, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', 
            [title, author, description, cover_url, published_date, pageCount, created_by]
        );
        const newBook = bookResult.rows[0];

        // 2. Insert the genres into the junction table
        if (genreIds && genreIds.length > 0) {
            const genreValues = genreIds.map((_, i) => `($1, $${i + 2})`).join(',');
            const genreQuery = `INSERT INTO books.book_genres (book_id, genre_id) VALUES ${genreValues}`;
            await client.query(genreQuery, [newBook.id, ...genreIds]);
        }

        await client.query('COMMIT');
        return newBook;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Helper to get all books with their genre names aggregated
export const getAllBooks = async () => {
    const query = `
        SELECT 
            b.*, 
            COALESCE(json_agg(g.name) FILTER (WHERE g.name IS NOT NULL), '[]') as genres
        FROM books.booklist b
        LEFT JOIN books.book_genres bg ON b.id = bg.book_id
        LEFT JOIN books.genres g ON bg.genre_id = g.id
        GROUP BY b.id
        ORDER BY b.title ASC
    `;
    const result = await pool.query(query);
    return result.rows;
}

export const findBookByTitleandAuthor = async(title: string, author: string) => {
    const result = await pool.query(
        'SELECT * FROM books.booklist WHERE LOWER(title)=LOWER($1) AND LOWER(author)= LOWER($2)',
        [title, author]
    );
    return result.rows[0];
}

export const getBookbyID = async(id: number) => {
    const query = `
        SELECT b.*, COALESCE(json_agg(g.name) FILTER (WHERE g.name IS NOT NULL), '[]') as genres
        FROM books.booklist b
        LEFT JOIN books.book_genres bg ON b.id = bg.book_id
        LEFT JOIN books.genres g ON bg.genre_id = g.id
        WHERE b.id = $1
        GROUP BY b.id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

//Function to get only partial data of all books
export const getAllBooksPartialData = async() =>{
    const result = await pool.query('SELECT id,title,author,cover_url FROM books.booklist ORDER BY title ASC');
    return result.rows;
}

export const updateBookDetails = async (
    id: number,
    title: string,
    author: string,
    description: string,
    cover_url: string | null,
    published_date: string,
    pageCount: number,
    genreIds: number[]
) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update basic book info (only update cover_url if a new one is provided)
        const updateQuery = `
            UPDATE books.booklist 
            SET title = $1, author = $2, description = $3, 
                cover_url = COALESCE($4, cover_url), 
                published_date = $5, pagecount = $6
            WHERE id = $7
        `;
        await client.query(updateQuery, [title, author, description, cover_url, published_date, pageCount, id]);

        // 2. Refresh Genres: Delete old ones and insert new ones
        await client.query('DELETE FROM books.book_genres WHERE book_id = $1', [id]);
        
        if (genreIds && genreIds.length > 0) {
            const values = genreIds.map((_, i) => `($1, $${i + 2})`).join(',');
            await client.query(`INSERT INTO books.book_genres (book_id, genre_id) VALUES ${values}`, [id, ...genreIds]);
        }

        await client.query('COMMIT');
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const deleteBookByID = async(id: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // First delete from the junction table
        await client.query('DELETE FROM books.book_genres WHERE book_id = $1', [id]);
        // Then delete the book itself
        await client.query('DELETE FROM books.booklist WHERE id = $1', [id]);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
