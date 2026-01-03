import type{ Request, Response } from "express";
import { createBook } from "../../models/books/booklist.model.js";
import { getAllBooks } from "../../models/books/booklist.model.js";

export const addNewBook = async (req: Request, res: Response) =>{
    try{
        const {title, author, description, published_date, language} = req.body;
        const file = req.file;
        if(!file){
            return res.status(400).json({message:"Book cover is required"});
        }
        const cover_url = file.path;
        const created_by = req.user?.id;
        if(!created_by){
            return res.status(400).json({message: "Invalid user"});
        }
        const newBook = await createBook(title, author, description, cover_url, published_date, language, created_by);
        return res.status(201).json({message: "New book added successfully", details: newBook});
    }catch(err: any){
        if(err.code === '23505' || err.message.includes('unique constraint')){
            return res.status(409).json({message:"This books already exists"});
        }
        console.error(err);
        res.status(500).json({message:  "Internal Server Error while adding new book"});
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