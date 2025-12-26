import { Router } from "express";
import { verifyRegisterOTP } from "../controllers/otp.controller.js";

const router = Router();

router.post('/verify/register',verifyRegisterOTP);

export default router;