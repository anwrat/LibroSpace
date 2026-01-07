import {Router} from 'express';
import {loginUser, registerUser, getCurrentUser, logOutUser} from '../../controllers/auth/auth.controller.js';
import { authenticateToken } from '../../middleware/auth/auth.middleware.js';
import {validate} from "../../middleware/validation/validate.middleware.js";
import { loginSchema,registerSchema } from '../../schemas/auth.schema.js';

const router = Router();

router.post('/register',validate(registerSchema),registerUser);
router.post('/login',validate(loginSchema),loginUser);

router.get('/me',authenticateToken, getCurrentUser);
router.post('/logout',authenticateToken, logOutUser)

export default router;