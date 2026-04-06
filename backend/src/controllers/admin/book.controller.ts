import type{ Request, Response } from "express";
import { createBook,getAllBooks, findBookByTitleandAuthor } from "../../models/books/booklist.model.js";
import { createGenre, checkIfGenreExists, getAllGenres, deleteGenre } from "../../models/books/genres.model.js";
import { deleteGenreSchema } from "../../schemas/book.schema.js";

export const addNewBook = async (req: Request, res: Response) => {
    try {
        // genres should be sent as an array of IDs, e.g., [1, 5, 12]
        const { title, author, description, published_date, pageCount, genres } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "Book cover is required" });
        }

        const cover_url = file.path;
        const created_by = req.user?.id;

        if (!created_by) {
            return res.status(400).json({ message: "Invalid user" });
        }

        // Parse genres if they come as a string (common with multi-part form data)
        const genreIds = typeof genres === 'string' ? JSON.parse(genres) : genres;

        const newBook = await createBook(
            title, 
            author, 
            description, 
            cover_url, 
            published_date, 
            pageCount, 
            created_by,
            genreIds
        );

        return res.status(201).json({ 
            message: "New book added successfully", 
            details: newBook 
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error while adding new book" });
    }
}

export const checkifBookExists = async(req: Request, res: Response) => {
    try {
        const { title, author } = req.body;
        const book = await findBookByTitleandAuthor(title, author);
        return res.status(200).json({ 
            message: book ? "Book already exists" : "Book does not exist", 
            exists: !!book 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error while checking if book exists" });
    }
}

export const fetchAllBooks = async(req: Request, res: Response) => {
    try {
        const books = await getAllBooks();
        return res.status(200).json({ books });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error while fetching books" });
    }
}

export const fetchAllGenres = async(req: Request, res: Response)=>{
    try{
        const genres = await getAllGenres();
        return res.status(200).json({data: genres});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching genres"});
    }
}

export const addNewGenre = async(req: Request, res: Response)=>{
    try{
        const {name} = req.body;
        const existingGenre = await checkIfGenreExists(name);
        if(existingGenre){
            return res.status(400).json({message: "Genre already exists"});
        }
        const newGenre = await createGenre(name);
        return res.status(201).json({success: true, message: "New genre added successfully", data: newGenre});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while adding new genre"});
    }
}

export const removeGenre = async(req: Request, res: Response)=>{
    try{
        const {id} = deleteGenreSchema.parse(req.params);
        const deletedGenre = await deleteGenre(Number(id));
        if(!deletedGenre){
            return res.status(404).json({message: "Genre not found"});
        }
        return res.status(200).json({success: true, message: "Genre deleted successfully", data: deletedGenre});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while deleting genre"});
    }   
}

