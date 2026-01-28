import { Router } from "express";
import { getAllBooks } from "../../controllers/users/books.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";

const router = Router();

router.get("/",authenticateToken,getAllBooks)

export default router;

