import { Router } from "express";
import { getAllBooks,getBookDetailsbyID, getQuotesForBook, toggleSaveQuote, getSavedQuotes } from "../../controllers/users/books.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";

const router = Router();

router.get("/",authenticateToken,getAllBooks);
router.get("/:id",authenticateToken,getBookDetailsbyID);
router.get("/quotes/book/:id", authenticateToken, getQuotesForBook);
router.post("/quotes/save/:quote_id", authenticateToken, toggleSaveQuote);
router.get("/quotes/saved", authenticateToken, getSavedQuotes);

export default router;

