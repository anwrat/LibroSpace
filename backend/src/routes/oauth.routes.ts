import {Router} from 'express';
import { googleOAuthHandler } from '../controllers/oauth.controller.js';

const router = Router();

//For Google OAuth
router.get('/google',googleOAuthHandler);

export default router;