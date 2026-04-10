import { Router } from "express";
import { getAllBooks,getBookDetailsbyID, getQuotesForBook } from "../../controllers/users/books.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";

const router = Router();

router.get("/",authenticateToken,getAllBooks);
router.get("/:id",authenticateToken,getBookDetailsbyID);
router.get("/quotes/:id", authenticateToken, getQuotesForBook);

export default router;

