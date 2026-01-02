import { authorizeAdmin } from "../../middleware/auth/admin.middleware.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { Router } from "express";
import { fetchAllUsers } from "../../controllers/admin/users.controller.js";
import { addNewBook,fetchAllBooks } from "../../controllers/admin/book.controller.js";
import { bookImgUpload } from "../../middleware/imgupload/bookimg.middleware.js";

const router = Router();

router.get('/users',authenticateToken, authorizeAdmin, fetchAllUsers)

// Books routes
router.post('/books/add',authenticateToken, authorizeAdmin, bookImgUpload.single('cover'),addNewBook)
router.get('/books',authenticateToken,authorizeAdmin,fetchAllBooks);

export default router;