import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req,res)=>{

}

export const loginUser = async (req,res)=>{

}