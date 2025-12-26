import { Router } from "express";
import { verifyRegisterOTP } from "../controllers/otp.controller.js";

const router = Router();

router.post('/register/verify',verifyRegisterOTP);

export default router;