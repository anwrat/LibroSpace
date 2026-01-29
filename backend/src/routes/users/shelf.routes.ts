import { Router } from "express";
import { addBooktoShelf,getMyShelves,updateBookProgress,checkBookInShelf } from "../../controllers/users/shelf.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { addToShelfSchema,updateProgressSchema } from "../../schemas/shelf.schema.js";

const router = Router();

router.post("/",authenticateToken,validate(addToShelfSchema),addBooktoShelf);
router.post("/updateprogress",authenticateToken,validate(updateProgressSchema),updateBookProgress);
router.get("/",authenticateToken,getMyShelves);
router.get("/:id",authenticateToken, checkBookInShelf);

export default router;

