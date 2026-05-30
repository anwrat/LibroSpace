"use client";

import LandingNav from "@/components/Navbar/LandingNav";
import { forgotPassword, verifyForgotPasswordOTP } from "@/lib/auth";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

type StepType = "REQUEST_EMAIL" | "VERIFY_AND_RESET";

export default function VerifyOtpPage() {
  const [step, setStep] = useState<StepType>("REQUEST_EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate password on change to give instant UI feedback
  useEffect(() => {
    if (!newPassword) {
      setPasswordError("");
      return;
    }

    const minMaxValid = newPassword.length >= 8 && newPassword.length <= 20;
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!minMaxValid) {
      setPasswordError("Password must be between 8 and 20 characters long.");
    } else if (!hasLetter) {
      setPasswordError("Password must include at least one letter.");
    } else if (!hasNumber) {
      setPasswordError("Password must include at least one number.");
    } else if (!hasSpecial) {
      setPasswordError("Password must include at least one special character.");
    } else {
      setPasswordError("");
    }
  }, [newPassword]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword(email);
      toast.success("OTP sent successfully to your email!");
      setStep("VERIFY_AND_RESET");
    } catch (err: any) {
      console.error("Forgot password initialization error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to send verification token. Please verify your email identifier.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Final defensive guard check against invalid configurations
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (
      newPassword.length < 8 ||
      newPassword.length > 20 ||
      !hasLetter ||
      !hasNumber ||
      !hasSpecial
    ) {
      setError(
        "Please satisfy all password safety criteria regulations before updating.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await verifyForgotPasswordOTP(email, otp, newPassword);
      if (response?.data?.success) {
        toast.success("Password changed successfully! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setError(
          response?.data?.message || "Invalid OTP token validation failure.",
        );
      }
    } catch (err: any) {
      console.error("OTP password collection update error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid code credentials or confirmation failure.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-main px-6">
      <Toaster position="top-center" />
      <LandingNav showLoginButton={false} />

      <div className="max-w-md w-full border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-sm bg-white">
        {step === "REQUEST_EMAIL" ? (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Reset Password
              </h1>
              <p className="text-gray-400 text-sm font-medium mt-1.5">
                Enter your identity email to generate a verification code.
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl focus-within:border-[#14919B] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14919B]/10 transition-all duration-200 group">
                <Mail
                  size={20}
                  className="text-gray-400 group-focus-within:text-[#14919B] transition-colors"
                />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full text-sm bg-transparent border-none outline-hidden text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-semibold px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-4 px-6 bg-[#14919B] hover:bg-[#11767e] text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Sending Token...</span>
                </>
              ) : (
                <span>Send OTP</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset} className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Enter Verification Code
              </h1>
              <p className="text-gray-400 text-sm font-medium mt-1.5">
                We sent a secure token key to{" "}
                <span className="text-gray-700 font-bold">{email}</span>.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {/* OTP Field */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl focus-within:border-[#14919B] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14919B]/10 transition-all duration-200 group">
                  <KeyRound
                    size={20}
                    className="text-gray-400 group-focus-within:text-[#14919B] transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="6-Digit OTP Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    disabled={loading}
                    className="w-full text-sm bg-transparent border-none outline-hidden text-gray-800 placeholder-gray-400 font-medium tracking-widest"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl focus-within:border-[#14919B] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14919B]/10 transition-all duration-200 group">
                  <Lock
                    size={20}
                    className="text-gray-400 group-focus-within:text-[#14919B] transition-colors"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Secure Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full text-sm bg-transparent border-none outline-hidden text-gray-800 placeholder-gray-400 font-medium tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Microfeedback Password Hints Area */}
                {passwordError ? (
                  <p className="text-amber-600 text-[11px] font-medium px-1 mt-0.5">
                    {passwordError}
                  </p>
                ) : (
                  newPassword && (
                    <p className="text-emerald-600 text-[11px] font-bold px-1 mt-0.5">
                      ✓ Strong and valid password complexity met.
                    </p>
                  )
                )}
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-semibold px-1">{error}</p>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || !otp || !newPassword || !!passwordError}
                className="w-full py-4 px-6 bg-[#14919B] hover:bg-[#11767e] text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing Reset...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setStep("REQUEST_EMAIL");
                  setNewPassword("");
                  setOtp("");
                }}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors py-1 text-center"
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
