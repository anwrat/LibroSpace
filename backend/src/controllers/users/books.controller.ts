import { getAllBooksPartialData, getBookbyID } from "../../models/books/booklist.model.js";
import type{ Request,Response } from "express";
import { getAllBooksPartialDataSchema,BookIdParamSchema, getQuotesByBookIdSchema } from "../../schemas/book.schema.js";
import { getQuotesByBookId } from "../../models/books/book_quotes.model.js";

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

export const getBookDetailsbyID = async(req: Request, res: Response) =>{
    try{
        const {id} = BookIdParamSchema.parse(req.params);
        const book = await getBookbyID(id);
        if(!book){
            return res.status(404).json({message: "Book not found"});
        }
        return res.status(200).json(book);
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching book details"});
    }
}

export const getQuotesForBook = async(req: Request, res: Response)=>{
    try{
        const {id} = getQuotesByBookIdSchema.parse(req.params);
        const quotes = await getQuotesByBookId(Number(id));
        return res.status(200).json({data: quotes});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching book quotes"});
    }
}