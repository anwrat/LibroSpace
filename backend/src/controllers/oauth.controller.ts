import type{ Request, Response } from "express";

//Redirect after succesful Google OAuth Login
export const googleAuthRedirect = async (req: Request, res: Response)=>{
    try{
        const token = (req.user as any).token;
        
        res.cookie("token",token,{
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });
        return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }catch(err){
        console.error("Error while redirecting from google",err);
        res.status(500).json({message:"Internal Server Error while redirecting from google"});
    }
}