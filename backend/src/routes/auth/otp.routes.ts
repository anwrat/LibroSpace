import { Router } from "express";
import {
  verifyRegisterOTP,
  verifyForgotPasswordOTP,
} from "../../controllers/auth/otp.controller.js";

const router = Router();

router.post("/register/verify", verifyRegisterOTP);
router.post("/forgot-password/verify", verifyForgotPasswordOTP);

export default router;
