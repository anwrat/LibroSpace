import { authorizeAdmin } from "../../middleware/auth/admin.middleware.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { Router } from "express";
import { fetchAllUsers } from "../../controllers/admin/users.controller.js";
import { addNewBook,fetchAllBooks, checkifBookExists, addNewGenre, fetchAllGenres, removeGenre } from "../../controllers/admin/book.controller.js";
import { bookImgUpload } from "../../middleware/imgupload/bookimg.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { createGenreSchema } from "../../schemas/book.schema.js";

const router = Router();

router.get('/users',authenticateToken, authorizeAdmin, fetchAllUsers)

// Books routes
router.post('/books/add',authenticateToken, authorizeAdmin, bookImgUpload.single('cover'),addNewBook);
router.post('/books/check',authenticateToken,authorizeAdmin,checkifBookExists);
router.get('/books',authenticateToken,authorizeAdmin,fetchAllBooks);

//Genre routes
router.post('/genres/add', authenticateToken, authorizeAdmin, validate(createGenreSchema), addNewGenre);
router.get('/genres', authenticateToken, authorizeAdmin, fetchAllGenres);
router.delete('/genres/:id', authenticateToken, authorizeAdmin, removeGenre);

export default router;