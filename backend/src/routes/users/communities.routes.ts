import { Router } from "express";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { CreateCommunitySchema } from "../../schemas/communities.schema.js";
import { addNewCommunity } from "../../controllers/users/communities.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { communityImgUpload } from "../../middleware/imgupload/communityimg.middleware.js";

const router = Router();

router.post('/',authenticateToken,communityImgUpload.single('photo_url'),validate(CreateCommunitySchema),addNewCommunity);

export default router;