import type{ Request, Response } from "express";
import { signToken } from "../../utils/jwt.js";

//Redirect after succesful Google OAuth Login
export const googleAuthRedirect = async (req: Request, res: Response)=>{
    try{
        const user = req.user!;

        const token = signToken({
            id: user.id,
            email:user.email,
            name: user.name
        });
        
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