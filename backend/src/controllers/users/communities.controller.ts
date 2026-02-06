import type{ Request,Response } from "express";
import { createCommunity,getAllCommunities } from "../../models/communities/communities.model.js";

export const addNewCommunity = async(req: Request, res: Response) =>{
    try{
        const {name, description} = req.body;
        const file = req.file;
        if(!file){
            return res.status(400).json({message: "Community photo is required"});
        }
        const photo_url = file.path;
        const created_by = req.user?.id;
        if(!created_by){
            return res.status(400).json({message: "Invalid user"});
        }
        const newCommunity = await createCommunity(name, description, photo_url, created_by);
        return res.status(201).json({message: "New community created successfully", details: newCommunity});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while adding new community"});
    }
}

export const fetchAllCommunities = async(req:Request, res: Response)=>{
    try{
        const communities = await getAllCommunities();
        return res.status(200).json(communities);
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching communities"});
    }
}