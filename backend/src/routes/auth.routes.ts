import {Router} from 'express';
import {loginUser, registerUser, googleOAuthHandler} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
//For Google OAuth
router.get('/google',googleOAuthHandler);

export default router;