import { Router } from "express";
import { verifyRegisterOTP } from "../../controllers/auth/otp.controller.js";

const router = Router();

router.post('/register/verify',verifyRegisterOTP);

export default router;