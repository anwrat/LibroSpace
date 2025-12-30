import { authorizeAdmin } from "../../middleware/auth/admin.middleware.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { Router } from "express";
import { fetchAllUsers,addNewBook } from "../../controllers/admin/admin.controller.js";

const router = Router();

router.get('/users',authenticateToken, authorizeAdmin, fetchAllUsers)

router.post('/books',authenticateToken, authorizeAdmin, addNewBook)

export default router;