import {Router} from 'express';
import { googleAuthRedirect } from '../../controllers/auth/oauth.controller.js';
import passport from '../../middleware/auth/passport.middleware.js';

const router = Router();

//Redirect to google OAuth
router.get('/google', passport.authenticate("google",{scope: ["profile","email"]}));

//Google OAuth callback
router.get("/google/callback",passport.authenticate("google",{session: false}),googleAuthRedirect);

export default router;