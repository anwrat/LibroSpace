import type{ Request,Response } from "express";
import { createCommunity,getAllCommunities, joinedCommunities, getCommunitybyID, isUserMember } from "../../models/communities/communities.model.js";
import { CommunityIdParamSchema } from "../../schemas/communities.schema.js";

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

export const fetchJoinedCommunities = async(req: Request, res: Response)=>{
    try{
        const user_id = req.user?.id;
        if(!user_id){
            return res.status(400).json({message: "Invalid user"});
        }
        const communities = await joinedCommunities(user_id);
        return res.status(200).json(communities);
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching joined communities"});
    }

}

export const getCommunityDetailsbyID = async(req: Request, res: Response) =>{
    try{
        const {id} = CommunityIdParamSchema.parse(req.params);
        const community = await getCommunitybyID(id);
        if(!community){
            return res.status(404).json({message: "Community not found"});
        }
        return res.status(200).json(community);
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while fetching community details"});
    }
}

export const checkUserMembership = async(req: Request, res: Response)=>{
    try{
        const user_id = req.user?.id;
        if(!user_id){
            return res.status(400).json({message: "Invalid user"});
        }
        const {id} = CommunityIdParamSchema.parse(req.params);
        const isMember = await isUserMember(user_id, Number(id));
        if(isMember.length>0){
            return res.status(200).json({isMember: true, role: isMember[0].role});
        }
        return res.status(200).json({isMember: false});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error while checking membership"});
    }
}