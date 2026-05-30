import { Router } from "express";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logOutUser,
  updateProfilePicture,
  forgotPassword,
} from "../../controllers/auth/auth.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { loginSchema, registerSchema } from "../../schemas/auth.schema.js";
import { profilePicChange } from "../../middleware/imgupload/profilepic.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", authenticateToken, logOutUser);

router.post(
  "/profilepic/update",
  authenticateToken,
  profilePicChange.single("profile"),
  updateProfilePicture,
);
router.post("/forgot-password", forgotPassword);
export default router;
