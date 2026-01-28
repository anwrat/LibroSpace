import { getAllBooksPartialData } from "../../models/books/booklist.model.js";
import type{ Request,Response } from "express";
import { getAllBooksPartialDataSchema } from "../../schemas/book.schema.js";

export const getAllBooks = async(req:Request, res: Response) =>{
    try{
        const books = await getAllBooksPartialData();
        const validatedBooks = getAllBooksPartialDataSchema.parse(books);
        return res.status(200).json(validatedBooks);
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching books"});
    }

}