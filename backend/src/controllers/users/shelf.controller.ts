import type{ Request,Response } from "express";
import { addtoShelf,updateProgress,getUserShelves, checkIfBookInShelf } from "../../models/books/user_shelves.model.js";
import { BookIdParamSchema } from "../../schemas/book.schema.js";

export const getMyShelves = async(req:Request, res:Response) =>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const shelves = await getUserShelves(userId);
        return res.status(200).json(shelves);
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while getting shelves"});
    }
}

export const checkBookInShelf = async(req: Request, res: Response)=>{
    try{
        const userId = req.user?.id;
        const {id} = BookIdParamSchema.parse(req.params);
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const result = await checkIfBookInShelf(userId,Number(id));
        return res.status(200).json({inShelf: !!result});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Internal Server Error while checking book in shelf"});
    }
}

export const addBooktoShelf = async(req: Request, res:Response) =>{
    try{
        const userId = req.user?.id;
        const {bookId,shelf} = req.body;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const result = await addtoShelf(userId,bookId,shelf);
        return res.status(201).json({message: "Book added to shelf"});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Internal Server Error while adding book to shelf"});
    }
}

export const updateBookProgress = async(req: Request, res: Response) =>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const {bookId, progress} = req.body;
        const result = await updateProgress(userId,bookId,progress);
        return res.status(201).json({message: "Updated Book Progress successfully", data: result.rows[0]});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Internal Server Error while updating book progress"});
    }
}