import { getAllBooksPartialData } from "../../models/books/booklist.model.js";
import type{ Request,Response } from "express";

export const getAllBooks = async(req:Request, res: Response) =>{
    try{
        const books = await getAllBooksPartialData();
        return res.status(200).json(books);
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching books"});
    }

}