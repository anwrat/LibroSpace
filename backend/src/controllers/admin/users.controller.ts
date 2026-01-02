import type{ Request, Response } from "express";
import { getAllUsers } from "../../models/auth/users.model.js";

export const fetchAllUsers = async (req: Request, res: Response) =>{
    try{
        const users = await getAllUsers();
        return res.status(200).json({users});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching users"});
    }

}