import type{ Request,Response } from "express";
import { checkforActiveSession,insertInReadingSession, updateNotes, endAndCalculateDuration, getSessionDetails, getLatestSessionEndPage} from "../../models/reading/reading_sessions.model.js";
import { updateProgress, addtoShelf } from "../../models/books/user_shelves.model.js";
import { getBookbyID } from "../../models/books/booklist.model.js";

export const startReadingSession = async (req: Request, res: Response) => {
    try {
        const { book_id } = req.body;
        const user_id = req.user?.id;

        if (!user_id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Check for active sessions first
        const active = await checkforActiveSession(user_id);
        if (active.length > 0) {
            return res.status(400).json({ success: false, message: "You already have an active session" });
        }

        // Determine start page from latest session
        const lastEndPage = await getLatestSessionEndPage(user_id, book_id);
        
        // If lastEndPage exists, start at lastEndPage + 1. Otherwise, start at 1.
        const start_page = lastEndPage !== null ? lastEndPage + 1 : 1;

        // Start the session
        const session = await insertInReadingSession(user_id, book_id, start_page);

        return res.status(201).json({ 
            success: true, 
            message: lastEndPage ? `Resuming from page ${start_page}` : "Starting fresh session", 
            data: session 
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const updateSessionNotes = async (req: Request, res: Response) => {
    try {
        const { session_id, notes } = req.body;
        const user_id = req.user?.id;
        if(!user_id){
            return res.status(401).json({success: false, message: "Unauthorized: User not found"});
        }
        const result = await updateNotes(notes, session_id, user_id);
        res.status(200).json({ success: true, message: "Notes updated succesfully", data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error saving notes" });
    }
};

export const endReadingSession = async(req: Request, res: Response) =>{
    try{
        const { session_id, end_page, notes, book_id } = req.body;
        const user_id = req.user?.id;
        if(!user_id){
            return res.status(401).json({success: false, message: "Unauthorized: User not found"});
        }
        const sessionUpdate = await endAndCalculateDuration(end_page, notes, session_id, user_id);
        const bookData = await getBookbyID(book_id);
        if(!bookData){
            return res.status(404).json({success: false, message: `Book with id ${book_id} not found`});
        }
        const totalPages = bookData.pagecount;
        if(end_page>totalPages){
            return res.status(400).json({success: false, message: `End page (${end_page}) cannot exceed total page(${totalPages})`});
        }
        const progressPercentage = Math.min(Math.round((end_page/totalPages)*100),100);
        //If end page is equal to total page, move the book to "read" shelf
        if(end_page === totalPages){
            await addtoShelf(user_id, book_id, 'read');
        }
        await updateProgress(user_id,book_id,progressPercentage);
        return res.status(201).json({success: true, message: "Session ended and progress saved", data: sessionUpdate});
    }catch(err){
        console.error(err);
        return res.status(500).json({success: false, message: "Internal Server Error while ending session"});
    }
}

export const getSession = async(req: Request, res: Response)=>{
    try{
        const { session_id } = req.params;
        if(!session_id){
            return res.status(401).json({success: false, message: "Session Id is missing"});
        }
        const user_id = req.user?.id;
        if(!user_id){
            return res.status(401).json({success: false, message: "Unauthorized: User not found"});
        }
        const session = await getSessionDetails(Number(session_id), user_id);
        if(session.rows.length === 0){
            return res.status(404).json({success: false, message: "Session not found"});
        }
        return res.status(201).json({success: true, message: "Session found", data: session.rows[0]});
    }catch(err){
        console.error(err);
        return res.status(500).json({success: false, message: "Internal Server Error while fetching session details"});
    }
}