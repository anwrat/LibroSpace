import { Router } from "express";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { CreateCommunitySchema } from "../../schemas/communities.schema.js";
import { addNewCommunity, fetchAllCommunities, fetchJoinedCommunities, getCommunityDetailsbyID, checkUserMembership } from "../../controllers/users/communities.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { communityImgUpload } from "../../middleware/imgupload/communityimg.middleware.js";

const router = Router();

router.post('/',authenticateToken,communityImgUpload.single('photo_url'),validate(CreateCommunitySchema),addNewCommunity);
router.get('/',authenticateToken,fetchAllCommunities);
router.get('/joined',authenticateToken, fetchJoinedCommunities);
router.get('/:id',authenticateToken,getCommunityDetailsbyID);
router.get('/:id/membership', authenticateToken, checkUserMembership);

export default router;