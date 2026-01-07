import type{ Request, Response } from "express";
import { createBook,getAllBooks, findBookByTitleandAuthor } from "../../models/books/booklist.model.js";

export const addNewBook = async (req: Request, res: Response) =>{
    try{
        const {title, author, description, published_date, pageCount} = req.body;
        const file = req.file;
        if(!file){
            return res.status(400).json({message:"Book cover is required"});
        }
        const cover_url = file.path;
        const created_by = req.user?.id;
        if(!created_by){
            return res.status(400).json({message: "Invalid user"});
        }
        const newBook = await createBook(title, author, description, cover_url, published_date, pageCount, created_by);
        return res.status(201).json({message: "New book added successfully", details: newBook});
    }catch(err: any){
        console.error(err);
        res.status(500).json({message:  "Internal Server Error while adding new book"});
    }
}

export const checkifBookExists = async(req: Request, res: Response)=>{
    try{
        const {title,author} = req.body;
        const book = await findBookByTitleandAuthor(title,author);
        if(book){
            return res.status(200).json({message: "Book already exists", exists: book});
        }
        return res.status(200).json({message: "Book does not exist" ,exists: !!book});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while checking if book exists"});
    }
}

export const fetchAllBooks = async(req: Request, res: Response)=>{
    try{
        const books = await getAllBooks();
        return res.status(200).json({books});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching books"});
    }
}