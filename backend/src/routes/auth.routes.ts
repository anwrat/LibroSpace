import {Router} from 'express';
import {loginUser, registerUser, getCurrentUser} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register',registerUser);
router.post('/login',loginUser);

router.get('/me',authenticateToken, getCurrentUser);

export default router;