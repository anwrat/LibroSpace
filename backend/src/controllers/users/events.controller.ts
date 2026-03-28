import type{ Request, Response } from "express";
import { listBookForExchange, checkIfAlreadyJoined, getBooksListedForExchange, getReceiverId, createExchangeRequest, checkExistingRequest, getSwapRequests } from "../../models/events/book_exchanges.model.js";

export const joinBookExchange = async(req: Request, res: Response)=>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const { book_title, book_author, condition, location_city, description } = req.body;
        const file = req.file;
        if(!file){
            return res.status(400).json({message:"Book cover is required"});
        }
        const image_url = file.path;
        const checkIfJoined = await checkIfAlreadyJoined(userId);
        //A user can only have 1 book for exchange currently available
        //Check if the user has already joined the book exchange
        if(checkIfJoined.length>=1){
            return res.status(400).json({success: false, message: "User already joined the exchange event."})
        }
        const result = await listBookForExchange(userId, book_title, book_author, condition, location_city, description, image_url);
        return res.status(201).json({success: true, message: "User joined book exchange!!!", data: result});
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Internal server error while joining book exchange" });
    }
}

export const getAllAvailableBooks = async(req: Request, res: Response) =>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const books = await getBooksListedForExchange(userId);
        return res.status(200).json({success: true, data: books});
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Internal server error while fetching all available books" });
    }
}

export const requestSwap = async(req: Request, res: Response)=>{
    try{
        const { listing_id} = req.body;
        const senderId = req.user?.id;
        if(!senderId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const receiverId = await getReceiverId(listing_id);
        if (!receiverId) {
            return res.status(404).json({ message: "The book listing no longer exists." });
        }
        if (senderId === receiverId) {
            return res.status(400).json({ message: "You cannot request your own book." });
        }
        // Prevent Duplicate Requests
        const alreadyRequested = await checkExistingRequest(senderId, listing_id);
        if (alreadyRequested) {
        return res.status(409).json({ 
            success: false, 
            message: "You have already sent a request for this book." 
        });
        }
        await createExchangeRequest(senderId, receiverId, listing_id);
        return res.status(201).json({success: true, message: "Swap request sent"});
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Internal server error while requesting for swap" });
    }
}

export const checkifUserJoined = async(req: Request, res: Response) =>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const checkIfJoined = await checkIfAlreadyJoined(userId);
        return res.status(200).json({success: true, joined: checkIfJoined.length>0});
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Internal server error checking user joined status" });
    }
}

export const getOngoingSwapRequests = async(req: Request, res: Response)=>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({message: "Unauthorized: User not found"});
        }
        const requests = await getSwapRequests(userId);
        return res.status(200).json({success: true, data: requests});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal server error while fetching ongoing swap requests"});
    }
}