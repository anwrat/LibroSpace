import { Router } from "express";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { CreateCommunitySchema, CreateDiscussionSchema, AddCommentSchema, ChangeMemberRoleSchema, StartNewRoomSchema } from "../../schemas/communities.schema.js";
import { addNewCommunity, joinCommunityasMember, leaveACommunity, fetchAllCommunities, fetchJoinedCommunities, getCommunityDetailsbyID, checkUserMembership, startDiscussion, getAllDiscussionsByCommunityId, addCommentToDiscussion, getAllComments, getDiscussionDetailsById, getAllMembersByCommunity, changeMemberRole, checkUserRole, getActiveRoom, startRoom} from "../../controllers/users/communities.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { communityImgUpload } from "../../middleware/imgupload/communityimg.middleware.js";

const router = Router();

router.post('/',authenticateToken,communityImgUpload.single('photo_url'),validate(CreateCommunitySchema),addNewCommunity);
router.get('/',authenticateToken,fetchAllCommunities);
router.get('/joined',authenticateToken, fetchJoinedCommunities);
router.get('/:id',authenticateToken,getCommunityDetailsbyID);
router.get('/:id/membership', authenticateToken, checkUserMembership);
router.post('/:id/membership', authenticateToken, joinCommunityasMember);
router.delete('/:id/membership', authenticateToken, leaveACommunity);

//Members related routes
router.get('/:id/members/all', authenticateToken, getAllMembersByCommunity);
router.get('/:id/members/role', authenticateToken, checkUserRole);
router.post('/:id/members/role', authenticateToken, validate(ChangeMemberRoleSchema), changeMemberRole);

//Discussions
router.post('/:id/discussions',authenticateToken, validate(CreateDiscussionSchema), startDiscussion);
router.get('/:id/discussions',authenticateToken, getAllDiscussionsByCommunityId);
router.get('/:community_id/discussions/:id',authenticateToken, getDiscussionDetailsById);

//Comments
router.post('/:community_id/discussions/:id/comments',authenticateToken, validate(AddCommentSchema),addCommentToDiscussion);
router.get('/:community_id/discussions/:id/comments', authenticateToken, getAllComments);

//Rooms
router.get('/:id/rooms/active', authenticateToken, getActiveRoom);
router.post('/:id/rooms', authenticateToken, validate(StartNewRoomSchema), startRoom);

export default router;