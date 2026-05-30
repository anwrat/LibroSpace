import type { Request, Response } from "express";
import { verifyOTP, deleteOTP } from "../../models/auth/otp.model.js";
import {
  createUser,
  updateUserPassword,
} from "../../models/auth/users.model.js";
import { hashPassword } from "../../utils/hash.js";
import {
  findRegisterSession,
  deleteRegisterSession,
} from "../../models/auth/registerSessions.model.js";

export const verifyRegisterOTP = async (req: Request, res: Response) => {
  try {
    const { sessionId, otp } = req.body;
    const session = await findRegisterSession(sessionId);
    if (!session) {
      return res.status(400).json({ message: "Invalid registration session" });
    }
    const valid = await verifyOTP(session.email, otp, "REGISTER");
    if (!valid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    await deleteOTP(session.email, "REGISTER");
    await deleteRegisterSession(sessionId, session.name);
    const user = await createUser(
      session.name,
      session.email,
      session.password,
    ); //Creating the user in users table
    return res.status(201).json({
      message: "Registration successful",
      success: true,
    });
  } catch (err) {
    console.error("Error while verifying register otp: ", err);
    res
      .status(500)
      .json({ message: "Internal Server Error while verifying Register OTP" });
  }
};

export const verifyForgotPasswordOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    const valid = await verifyOTP(email, otp, "FORGOT_PASSWORD");
    if (!valid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    await deleteOTP(email, "FORGOT_PASSWORD");
    const hashedPassword = await hashPassword(newPassword);
    await updateUserPassword(email, hashedPassword);
    return res.status(200).json({
      message: "Password reset successful",
      success: true,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message: "Internal Server Error while verifying Forgot Password OTP",
      });
  }
};
