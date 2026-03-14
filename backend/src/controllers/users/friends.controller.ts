import type{ Request,Response } from "express";
import { getAllFriends, createFriendRequest,acceptFriendRequest, cancelFriendRequest, getPendingRequests } from "../../models/friends/friendships.model.js";
import { getAllMessagesbetweenTwoUsers, markMessagesAsRead, unreadMessagesStatus } from "../../models/friends/messages.model.js";
import { getChatHistorySchema } from "../../schemas/friends.schema.js";

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

export const getFriendsList = async(req:Request, res:Response) =>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const friends = await getAllFriends(userId);
        return res.status(200).json({friends});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching friends list"});
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

export const getPendingFriendRequests = async(req: Request, res: Response) =>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const result = await getPendingRequests(userId);
        return res.status(200).json({pendingRequests: result});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching pending requests count"});
    }
}

export const getChatHistory = async(req: Request, res: Response) =>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const {friendId} = getChatHistorySchema.parse(req.params);
        const chatHistory = await getAllMessagesbetweenTwoUsers(userId, Number(friendId));
        return res.status(200).json({success: true, data: chatHistory});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching chat history"});
    }
}

export const changeMessageStatus = async(req: Request, res: Response) =>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const {friendId} = getChatHistorySchema.parse(req.params);
        const result = await markMessagesAsRead(userId, Number(friendId));
        return res.status(200).json({success: true, message: "Messages marked as read"});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while updating message status"});
    }
}

export const checkUnreadMessages = async(req: Request, res: Response) =>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const hasUnread = await unreadMessagesStatus(userId);
        return res.status(200).json({hasUnread});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while checking unread messages"});
    }
}

