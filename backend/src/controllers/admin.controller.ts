import type{ Request, Response } from "express";
import { getAllUsers } from "../models/users.model.js";
import { createBook } from "../models/booklist.model.js";

export const fetchAllUsers = async (req: Request, res: Response) =>{
    try{
        const users = await getAllUsers();
        return res.status(200).json({users});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching users"});
    }

}

export const addNewBook = async (req: Request, res: Response) =>{
    try{
        const {title, author, description, cover_url, published_date, language} = req.body;
        const created_by = req.user?.id;
        if(!created_by){
            return res.status(400).json({message: "Invalid user"});
        }
        const newBook = await createBook(title, author, description, cover_url, published_date, language, created_by);
        return res.status(201).json({message: "New book added successfully", details: newBook});
    }catch(err){
        console.error(err);
        res.status(500).json({message:  "Internal Server Error while adding new book"});
    }
}