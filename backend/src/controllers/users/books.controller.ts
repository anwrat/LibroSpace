import { getAllBooksPartialData, getBookbyID } from "../../models/books/booklist.model.js";
import type{ Request,Response } from "express";
import { getAllBooksPartialDataSchema,BookIdParamSchema, getQuotesByBookIdSchema, toggleSaveQuoteSchema } from "../../schemas/book.schema.js";
import { getQuotesByBookId, checkIfQuoteSavedbyUser, deleteSavedQuote, saveQuoteForUser, getSavedQuotesForUser } from "../../models/books/book_quotes.model.js";

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

export const toggleSaveQuote = async(req: Request, res: Response) => {
    try{
        const user_id = req.user?.id;
        if(!user_id){
            return res.status(400).json({message: "Invalid user"});
        }
        const {quote_id} = toggleSaveQuoteSchema.parse(req.params);
        const alreadySaved = await checkIfQuoteSavedbyUser(user_id, quote_id);
        if(alreadySaved.rows.length > 0){
            await deleteSavedQuote(user_id, quote_id);
            return res.status(200).json({message: "Quote unsaved"});
        }else{
            await saveQuoteForUser(user_id, quote_id);
            return res.status(200).json({message: "Quote saved"});
        }
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while toggling saved quote"});
    }
}

export const getSavedQuotes = async(req: Request, res: Response) => {
    try{
        const user_id = req.user?.id;
        if(!user_id){
            return res.status(400).json({message: "Invalid user"});
        }
        const savedQuotes = await getSavedQuotesForUser(user_id);
        return res.status(200).json({data: savedQuotes});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching saved quotes"});
    }
}