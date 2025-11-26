import type{ Request, Response } from "express";
import dotenv from 'dotenv';

//Redirect to google
export const googleOAuthHandler = async (req: Request, res: Response)=>{
    try{

    }catch(err){
        console.error("Error while redirecting to google",err);
        res.status(500).json({message:"Internal Server Error while redirecting to google"});
    }
}