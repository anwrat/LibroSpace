import { Router } from "express";
import { getAllBooks,getBookDetailsbyID } from "../../controllers/users/books.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";

const router = Router();

router.get("/",authenticateToken,getAllBooks);
router.get("/:id",authenticateToken,getBookDetailsbyID);

export default router;

