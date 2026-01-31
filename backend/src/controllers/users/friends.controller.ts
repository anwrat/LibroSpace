import type{ Request,Response } from "express";
import { getAllFriends, createFriendRequest,acceptFriendRequest, cancelFriendRequest } from "../../models/friends/friendships.model.js";

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

export const acceptAndUpdateFriendRequest = async (req: Request, res: Response) =>{
    try{
        const addresseeId = req.user?.id;
        if(!addresseeId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const {requesterId} = req.body;
        const result = await acceptFriendRequest(requesterId, addresseeId);
        if(result.rowCount === 0){
            return res.status(400).json({message: "Friend request not found or already accepted"});
        }
        return res.status(200).json({message: "Friend request accepted successfully"});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Internal Server Error while accepting friend request"});
    }
}

export const deleteFriendRequest = async(req:Request, res:Response)=>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const {targetId} = req.body;
        const result = await cancelFriendRequest(userId, targetId);
        if(result.rowCount === 0){
            return res.status(400).json({message: "Friend request not found or already cancelled"});
        }
        return res.status(200).json({message: "Friend request cancelled successfully"});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while deleting friend request"});
    }
}