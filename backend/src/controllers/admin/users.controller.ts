import type{ Request, Response } from "express";
import { getAllUsers, removeUser } from "../../models/auth/users.model.js";

export const fetchAllUsers = async (req: Request, res: Response) =>{
    try{
        const users = await getAllUsers();
        return res.status(200).json({users});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching users"});
    }

}

export const deleteUser = async (req: Request, res: Response) =>{
    try{
        const userId = parseInt(req.params.id!);
        await removeUser(userId);
        return res.status(200).json({message: "User deleted successfully"});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while deleting user"});
    }
}