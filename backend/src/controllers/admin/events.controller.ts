import type{ Request, Response } from "express";
import { getQuoteRequestById, approveQuoteRequest } from "../../models/events/quote_requests.model.js";
import { GetQuoteRequestDetailsSchema } from "../../schemas/events.schema.js";

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

export const approveQuote = async(req: Request, res: Response) =>{
    try{
        const { id } = GetQuoteRequestDetailsSchema.parse(req.params);
        const requestDetails = await getQuoteRequestById(id);
        if(!requestDetails){
            return res.status(404).json({ error: "Quote request not found" });
        }
        const approvedQuote = await approveQuoteRequest(id, requestDetails.book_id, requestDetails.text, requestDetails.page_number);
        return res.status(201).json({success: true, data: approvedQuote});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: "Failed to approve quote request" });
    }
}