import type{Request, Response} from 'express'; //This is a type-only import
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/db.js';
import {hashPassword,comparePassword} from '../utils/hash.js';
import {createUser, findUserByEmail} from '../models/users.model.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req: Request,res: Response)=>{
    try{
        const {name, email, password} = req.body;
        const existingUser = await findUserByEmail(email);
        if(existingUser){
            return res.status(500).json({message:"User with this email already exists"});
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

}