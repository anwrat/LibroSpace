import { api } from "./axios";

export type LoginPayload = { loginID: string; password: string };
export type RegisterPayload = { name: string; email: string; password: string };

export function loginUser(data: LoginPayload) {
  return api.post("/api/auth/login", data);
}

export function forgotPassword(email: string) {
  return api.post("/api/auth/forgot-password", { email });
}

export function verifyForgotPasswordOTP(
  email: string,
  otp: string,
  newPassword: string,
) {
  return api.post("/api/otp/forgot-password/verify", {
    email,
    otp,
    newPassword,
  });
}

export function registerUser(data: RegisterPayload) {
  return api.post("/api/auth/register", data);
}

export function verifyRegisterOTP(sessionId: string, otp: string) {
  return api.post("/api/otp/register/verify", { sessionId, otp });
}

export function getCurrentUser() {
  return api.get("/api/auth/me");
}

export function logOut() {
  return api.post("/api/auth/logout");
}
