import { Router } from "express";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { CreateCommunitySchema, CreateDiscussionSchema, AddCommentSchema } from "../../schemas/communities.schema.js";
import { addNewCommunity, fetchAllCommunities, fetchJoinedCommunities, getCommunityDetailsbyID, checkUserMembership, startDiscussion, getAllDiscussionsByCommunityId, addCommentToDiscussion } from "../../controllers/users/communities.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { communityImgUpload } from "../../middleware/imgupload/communityimg.middleware.js";

const router = Router();

router.post('/',authenticateToken,communityImgUpload.single('photo_url'),validate(CreateCommunitySchema),addNewCommunity);
router.get('/',authenticateToken,fetchAllCommunities);
router.get('/joined',authenticateToken, fetchJoinedCommunities);
router.get('/:id',authenticateToken,getCommunityDetailsbyID);
router.get('/:id/membership', authenticateToken, checkUserMembership);

//Discussions
router.post('/:id/discussions',authenticateToken, validate(CreateDiscussionSchema), startDiscussion);
router.get('/:id/discussions',authenticateToken, getAllDiscussionsByCommunityId);

//Comments
router.post('/:community_id/discussions/:id/comments',authenticateToken, validate(AddCommentSchema),addCommentToDiscussion);

export default router;