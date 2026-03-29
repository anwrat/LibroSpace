import { Router } from "express";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { CreateExchangeSchema, RequestSwapSchema, UpdateSwapStatusSchema } from "../../schemas/events.schema.js";
import { getAllAvailableBooks, joinBookExchange, requestSwap, checkifUserJoined, getOngoingSwapRequests, updateSwapRequestStatus, getAcceptedSwapsForUser } from "../../controllers/users/events.controller.js";
import { bookExchangeImgUpload } from "../../middleware/imgupload/bookexchangeimg.middleware.js";

const router = Router();

//For book exchange event
router.get('/bookexchange', authenticateToken, checkifUserJoined);
router.get('/bookexchange/books', authenticateToken, getAllAvailableBooks);
router.post('/bookexchange/join', authenticateToken, bookExchangeImgUpload.single('image'), validate(CreateExchangeSchema), joinBookExchange);
router.post('/bookexchange/request',authenticateToken,validate(RequestSwapSchema),requestSwap);
router.get('/bookexchange/requests', authenticateToken, getOngoingSwapRequests);
router.patch('/bookexchange/requests/update', authenticateToken, validate(UpdateSwapStatusSchema), updateSwapRequestStatus);
router.get('/bookexchange/accepted', authenticateToken, getAcceptedSwapsForUser);


export default router;