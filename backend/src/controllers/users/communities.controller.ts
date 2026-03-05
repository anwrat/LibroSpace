import type{ Request,Response } from "express";
import { createCommunity,getAllCommunities, joinedCommunities, getCommunitybyID, isUserMember } from "../../models/communities/communities.model.js";
import { CommunityIdParamSchema, DiscussionIdParamSchema } from "../../schemas/communities.schema.js";
import { createDiscussion, getDiscussionsByCommunityId } from "../../models/communities/discussions.model.js";
import { addComment, getCommentsbyDiscussionId } from "../../models/communities/comments.model.js";

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
        res.status(500).json({success: false, message: "Internal Server Error while checking membership"});
    }
}

export const startDiscussion = async(req: Request, res: Response)=>{
    try{
        const user_id = req.user?.id;
        if(!user_id){
            return res.status(400).json({message: "Invalid user"});
        }
        const {id} = CommunityIdParamSchema.parse(req.params);
        const {title, content} = req.body;
        const discussion = await createDiscussion(Number(id), user_id, title, content);
        return res.status(201).json({success: true,message: "Discussion created successfully", data: discussion});
    }catch(err){
        console.error(err);
        res.status(500).json({success: false, message: "Internal Server Error while creating discussion"});
    }
}

export const getAllDiscussionsByCommunityId = async(req: Request, res: Response)=>{
    try{
        const {id} = CommunityIdParamSchema.parse(req.params);
        const discussions = await getDiscussionsByCommunityId(id);
        return res.status(200).json({success: true, data: discussions});
    }catch(err){
        console.error(err);
        res.status(500).json({success: false, message: "Internal Server Error while fetching discussions"});
    }
}

export const addCommentToDiscussion = async(req: Request, res: Response) =>{
    try{
        const user_id = req.user?.id;
        if(!user_id){
            return res.status(400).json({message: "Invalid user"});
        }
        const {id} = DiscussionIdParamSchema.parse(req.params);
        const {content} = req.body;
        const comment = await addComment(id, user_id, content);
        return res.status(201).json({success: true, message: "Comment added successfully", data: comment});
    }catch(err){
        console.error(err);
        res.status(500).json({success: false, message: "Internal Server Errror while adding comment"});
    }
}

export const getAllComments = async(req: Request, res: Response) =>{
    try{
        const {id} = DiscussionIdParamSchema.parse(req.params);
        const comments = await getCommentsbyDiscussionId(id);
        return res.status(200).json({success: true, data: comments});
    }catch(err){
        console.error(err);
        res.status(500).json({success: false, message: "Internal Server Error while fetching comments"});
    }
}