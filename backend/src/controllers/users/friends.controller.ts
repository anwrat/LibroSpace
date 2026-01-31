import type{ Request,Response } from "express";
import { getAllFriends, createFriendRequest } from "../../models/friends/friendships.model.js";

export const sendFriendRequest = async(req:Request, res: Response)=>{
    try{
        const requesterId = req.user?.id;
        if(!requesterId){
            return res.status(401).json({message:"Unauthorized: User not found"});
        }
        const {addresseeId} = req.body;
        const result = await createFriendRequest(requesterId, addresseeId);
        if(result.rowCount === 0){
            return res.status(400).json({message: "Friend request already exists or you are already friends"});
        }
        return res.status(201).json({message: "Friend request sent successfully"});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while sending friend request"});
    }
}