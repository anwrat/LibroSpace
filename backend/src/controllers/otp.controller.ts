import type{ Request,Response } from "express";
import { verifyOTP,deleteOTP } from "../models/otp.model.js";
import { createUser } from "../models/users.model.js";

export const verifyRegisterOTP = async (req: Request, res: Response)=>{
    try{
        const {name,email,password,otp} = req.body;
        const valid = await verifyOTP(email,otp,"REGISTER");
        if(!valid){
            return res.status(400).json({message:"Invalid or expired OTP"});
        }
        await deleteOTP(email,"REGISTER");
        const user = await createUser(name,email,password);
        return res.status(201).json({
            message: "Registration successful",
            user,
        });
    }catch(err){
        console.error("Error while verifying register otp: ",err);
        res.status(500).json({message: "Internal Server Error while verifying Register OTP"});
    }
}