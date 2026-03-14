import { Router } from "express";
import { acceptAndUpdateFriendRequest, sendFriendRequest, deleteFriendRequest, getPendingFriendRequests, getFriendsList, changeMessageStatus, checkUnreadMessages } from "../../controllers/users/friends.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { sendFriendRequestSchema, acceptRequestSchema, deleteRequestSchema } from "../../schemas/friends.schema.js";
import { getChatHistory } from "../../controllers/users/friends.controller.js";

const router = Router();

router.post("/",authenticateToken,validate(sendFriendRequestSchema), sendFriendRequest);
router.put("/",authenticateToken,validate(acceptRequestSchema), acceptAndUpdateFriendRequest);
router.delete("/",authenticateToken,validate(deleteRequestSchema), deleteFriendRequest);
router.get("/pending",authenticateToken, getPendingFriendRequests);
router.get("/",authenticateToken, getFriendsList);

//For messages
router.get("/messages/:friendId", authenticateToken, getChatHistory);
router.put("/messages/:friendId", authenticateToken, changeMessageStatus);
router.get("/messages/check/unread", authenticateToken, checkUnreadMessages);

export default router;
