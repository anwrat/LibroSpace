import { authorizeAdmin } from "../middleware/admin.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { Router } from "express";
import { fetchAllUsers } from "../controllers/admin.controller.js";

const router = Router();

router.get('/users',authenticateToken, authorizeAdmin, fetchAllUsers)

export default router;