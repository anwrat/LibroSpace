import pool from "../../config/db.js";

export const getAllGenres = async () =>{
    const result = await pool.query('SELECT * FROM books.genres');
    return result.rows;
}

export const createGenre = async (name: string) =>{
    const result = await pool.query('INSERT INTO books.genres (name) VALUES ($1) RETURNING *', [name]);
    return result.rows[0];
}

export const deleteGenre = async (id: number) =>{
    const result = await pool.query('DELETE FROM books.genres WHERE id=$1 RETURNING *', [id]);
    return result.rows[0];
}

export const checkIfGenreExists = async(name: string) =>{
    const result = await pool.query('SELECT * FROM books.genres WHERE LOWER(name)=LOWER($1)', [name]);
    return result.rows[0];
}