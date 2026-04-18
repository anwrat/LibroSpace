import type{ Request, Response } from "express";
import { getQuoteRequestById, approveQuoteRequest, getAllQuoteRequests, rejectQuoteRequest } from "../../models/events/quote_requests.model.js";
import { GetQuoteRequestDetailsSchema } from "../../schemas/events.schema.js";
import { awardActivityXP } from "../../services/gamification.service.js";

export const getQuoteRequestDetails = async(req: Request, res: Response) =>{
    try{
        const { id } = GetQuoteRequestDetailsSchema.parse(req.params);
        const requestDetails = await getQuoteRequestById(id);
        if(!requestDetails){
            return res.status(404).json({ error: "Quote request not found" });
        }
        return res.status(201).json({success: true, data: requestDetails});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: "Failed to retrieve quote request details" });
    }
}

export const fetchAllQuoteRequests = async(req: Request, res: Response)=>{
    try{
        const requests = await getAllQuoteRequests();
        return res.status(200).json({success: true, data: requests});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Failed to fetch all quote requests"});
    }
}

export const updateQuoteStatus = async(req: Request, res: Response) =>{
    try{
        const {requestId, status, admin_feedback} = req.body;
        const requestDetails = await getQuoteRequestById(requestId);
        if(!requestDetails){
            return res.status(404).json({ error: "Quote request not found" });
        }
        if(status === "approved"){
            const approvedQuote = await approveQuoteRequest(requestId, requestDetails.book_id, requestDetails.text, requestDetails.page_number);
            //For quote approval, the user gets 50 XP
            await awardActivityXP(requestDetails.user_id, 'QUOTE_SUBMISSION', null);
            return res.status(201).json({success: true, data: approvedQuote});
        } else if(status === "rejected"){
            const rejectedQuote = await rejectQuoteRequest(requestId, admin_feedback);
            return res.status(201).json({success: true, data: rejectedQuote});
        } else {
            return res.status(400).json({ error: "Invalid status value" });
        }
    }catch(err){
        console.error(err);
        res.status(500).json({ error: "Failed to update quote request status" });
    }
}