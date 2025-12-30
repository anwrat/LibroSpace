import pool from "../../config/db.js";

export const createBook = async (title: string, author: string, description: string, cover_url: string, published_date: string, language: string, created_by: number) =>{
    const result = await pool.query('INSERT INTO books.booklist (title, author, description, cover_url, published_date, language, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [title, author, description, cover_url, published_date, language, created_by]);
    return result.rows[0];
}