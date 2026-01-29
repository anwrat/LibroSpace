import pool from "../../config/db.js";

export const createBook = async (title: string, author: string, description: string, cover_url: string, published_date: string, pageCount: number, created_by: number) =>{
    const result = await pool.query('INSERT INTO books.booklist (title, author, description, cover_url, published_date, pagecount, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [title, author, description, cover_url, published_date, pageCount, created_by]);
    return result.rows[0];
}

export const getAllBooks = async () =>{
    const result = await pool.query('SELECT * FROM books.booklist ORDER BY title ASC');
    return result.rows;
}

export const findBookByTitleandAuthor = async(title: string, author: string)=>{
    const result = await pool.query('SELECT * FROM books.booklist WHERE LOWER(title)=LOWER($1) AND LOWER(author)= LOWER($2)',[title,author]);
    return result.rows[0];
}

//Function to get only partial data of all books
export const getAllBooksPartialData = async() =>{
    const result = await pool.query('SELECT id,title,author,cover_url FROM books.booklist ORDER BY title ASC');
    return result.rows;
}

//Get book by ID
export const getBookbyID = async(id: number) =>{
    const result = await pool.query('SELECT * FROM books.booklist WHERE id=$1',[id]);
    return result.rows[0];
}