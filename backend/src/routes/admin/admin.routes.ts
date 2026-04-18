import { authorizeAdmin } from "../../middleware/auth/admin.middleware.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { Router } from "express";
import { fetchAllUsers } from "../../controllers/admin/users.controller.js";
import { addNewBook,fetchAllBooks, checkifBookExists, addNewGenre, fetchAllGenres, removeGenre, deleteBook, updateBook, addBookQuote, removeBookQuote, getAllQuotes } from "../../controllers/admin/book.controller.js";
import { getBookDetailsbyID } from "../../controllers/users/books.controller.js";
import { bookImgUpload } from "../../middleware/imgupload/bookimg.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { createGenreSchema, createBookQuoteSchema } from "../../schemas/book.schema.js";
import { fetchAllQuoteRequests, updateQuoteStatus } from "../../controllers/admin/events.controller.js";

const router = Router();

router.get('/users',authenticateToken, authorizeAdmin, fetchAllUsers);

// Books routes
router.post('/books/add',authenticateToken, authorizeAdmin, bookImgUpload.single('cover'),addNewBook);
router.post('/books/check',authenticateToken,authorizeAdmin,checkifBookExists);
router.get('/books',authenticateToken,authorizeAdmin,fetchAllBooks);
router.get('/books/:id', authenticateToken, authorizeAdmin, getBookDetailsbyID);
router.put('/books/:id', authenticateToken, authorizeAdmin, bookImgUpload.single('cover'), updateBook);
router.delete('/books/:id', authenticateToken, authorizeAdmin, deleteBook);

//Genre routes
router.post('/genres/add', authenticateToken, authorizeAdmin, validate(createGenreSchema), addNewGenre);
router.get('/genres', authenticateToken, authorizeAdmin, fetchAllGenres);
router.delete('/genres/:id', authenticateToken, authorizeAdmin, removeGenre);

//Book quotes routes
router.post('/quotes/add', authenticateToken, authorizeAdmin, validate(createBookQuoteSchema), addBookQuote);
router.delete('/quotes/:id', authenticateToken, authorizeAdmin, removeBookQuote);
router.get('/quotes', authenticateToken, authorizeAdmin, getAllQuotes);
router.get('/quotes/requests', authenticateToken, authorizeAdmin, fetchAllQuoteRequests);
router.post('/quotes/requests/update', authenticateToken, authorizeAdmin, updateQuoteStatus);

export default router;