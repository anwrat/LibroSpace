import { Router } from "express";
import { acceptAndUpdateFriendRequest, sendFriendRequest, deleteFriendRequest } from "../../controllers/users/friends.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { sendFriendRequestSchema, acceptRequestSchema, deleteRequestSchema } from "../../schemas/friends.schema.js";

const router = Router();

router.post("/",authenticateToken,validate(sendFriendRequestSchema), sendFriendRequest);
router.put("/",authenticateToken,validate(acceptRequestSchema), acceptAndUpdateFriendRequest);
router.delete("/",authenticateToken,validate(deleteRequestSchema), deleteFriendRequest);
export default router;
