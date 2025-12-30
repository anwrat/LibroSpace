import {Router} from 'express';
import {loginUser, registerUser, getCurrentUser, logOutUser} from '../../controllers/auth/auth.controller.js';
import { authenticateToken } from '../../middleware/auth/auth.middleware.js';

const router = Router();

router.post('/register',registerUser);
router.post('/login',loginUser);

router.get('/me',authenticateToken, getCurrentUser);
router.post('/logout',authenticateToken, logOutUser)

export default router;