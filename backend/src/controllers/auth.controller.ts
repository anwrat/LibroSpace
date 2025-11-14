import type{Request, Response} from 'express'; //This is a type-only import
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {hashPassword,comparePassword} from '../utils/hash.js';
import {createUser, findUserByEmail, findUserByName, loginByEmailorName} from '../models/users.model.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

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
        const hashed = await hashPassword(password);
        const result = await createUser(name,email,hashed);
        return res.status(201).json({
            message:"User registered successfully",
            result
        })
    }catch(err){
        console.error("Error while registering user: ",err);
        res.status(500).json({message: "Internal Server Error while registering user"});
    }

}

export const loginUser = async (req:Request,res:Response)=>{
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
        const token = jwt.sign(
            {id:user.id,email:user.email},
            JWT_SECRET,
            {expiresIn: '2h'}
        );
        return res.status(200).json({
            message: "User logged in successfully",
            token
        })
    }catch(err){
        console.error("Error while logging in: ",err);
        res.status(500).json({message: "Internal Server Error while logging user"});
    }
}