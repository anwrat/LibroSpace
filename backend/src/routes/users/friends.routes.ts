import { Router } from "express";
import { sendFriendRequest } from "../../controllers/users/friends.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { addresseeIdSchema } from "../../schemas/friends.schema.js";

const router = Router();

router.post("/",authenticateToken,validate(addresseeIdSchema), sendFriendRequest);

export default router;
