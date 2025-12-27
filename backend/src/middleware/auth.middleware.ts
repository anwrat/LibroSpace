import type{ Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";


declare global{
    namespace Express{
        interface Request{
            user?:{id: number; name: string; email: string};
        }
    }
}

export const authenticateToken = (req:Request, res: Response, next: NextFunction) =>{
    try{
        //Getting token from cookie
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({message:'Access Denied. No token provided'});
        }
        //Verifying token
        const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as {id: number,name: string ,email: string};
        req.user = decoded;
        next();
    }catch(err){
        console.error(err);
        return res.status(403).json({message:'Invalid or expired token'});
    }
}