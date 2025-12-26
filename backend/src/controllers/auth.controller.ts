import type{Request, Response} from 'express'; //This is a type-only import
import {hashPassword,comparePassword} from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';
import {findUserByEmail, findUserByName, loginByEmailorName} from '../models/users.model.js';
import { generateOTP } from '../utils/otp.js';
import { saveOTP } from '../models/otp.model.js';
import { sendOTPMail } from '../utils/email.js';
import { createRegisterSession } from '../models/registerSessions.model.js';

export const registerUser = async (req: Request,res: Response)=>{
    try{
        const {name, email, password} = req.body;
        const existingEmail = await findUserByEmail(email);
        if(existingEmail){
            return res.status(500).json({message:"User with this email already exists"});
        }
        const existingUser = await findUserByName(name);
        if(existingUser){
            return res.status(500).json({message:"Username already taken"});
        }
        const otp = generateOTP();
        await saveOTP(email,otp,"REGISTER");
        await sendOTPMail(email,otp);
        const hashed = await hashPassword(password);
        const sessionId = await createRegisterSession(name,email,hashed);
        return res.status(201).json({
            message:"OTP sent to email",
            sessionId
        })
    }catch(err){
        console.error("Error while registering user: ",err);
        res.status(500).json({message: "Internal Server Error while registering user"});
    }

}

export const loginUser = async (req:Request, res:Response)=>{
    try{
        const {loginID, password} = req.body;
        if(!loginID){
            return res.status(400).json({message:"Login ID is required"});
        }
        const user = await loginByEmailorName(loginID);
        if(!user){
            return res.status(401).json({message: "Invalid credentials. User not found."});
        }
        const checkPassword = await comparePassword(password,user.password);
        if(!checkPassword){
            return res.status(401).json({messaage:"Invalid credentials. Incorrect password."})
        }
        const token = signToken({id:user.id,email:user.email});
        //Using http only cookies to store JWT token
        res.cookie("token",token,{
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000 //2 hours
        });
        return res.status(200).json({
            message: "User logged in successfully",
            user
        })
    }catch(err){
        console.error("Error while logging in: ",err);
        res.status(500).json({message: "Internal Server Error while logging user"});
    }
}