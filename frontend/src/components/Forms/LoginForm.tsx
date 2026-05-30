"use client";

import { useState } from "react";
import { loginUser, getCurrentUser } from "@/lib/auth";
import GoogleButton from "../Buttons/GoogleButton";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginForm() {
  const [userID, setuserID] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const gotoRegister = () => {
    router.push("/register");
  };

  const gotoForgotPassword = () => {
    router.push("/login/verify");
  };

  async function handlelogin(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await loginUser({ loginID: userID, password });
      const res = await getCurrentUser();

      toast.success("Welcome back!");

      if (res.data?.user?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/user";
      }
    } catch (err: any) {
      console.error("Login failed", err);
      toast.error(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handlelogin} className="flex flex-col gap-6 w-full">
      <Toaster position="top-center" />

      <div>
        <h1 className="font-main font-black text-4xl text-gray-900 tracking-tight">
          Log In
        </h1>
        <p className="text-gray-400 text-sm font-medium mt-1.5">
          Access your interactive personal library notebook.
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl focus-within:border-[#14919B] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14919B]/10 transition-all duration-200 group">
          <User
            size={20}
            className="text-gray-400 group-focus-within:text-[#14919B] transition-colors"
          />
          <input
            type="text"
            placeholder="Username or Email"
            value={userID}
            onChange={(e) => setuserID(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full font-main text-sm bg-transparent border-none outline-hidden text-gray-800 placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl focus-within:border-[#14919B] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14919B]/10 transition-all duration-200 group">
          <Lock
            size={20}
            className="text-gray-400 group-focus-within:text-[#14919B] transition-colors"
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full font-main text-sm bg-transparent border-none outline-hidden text-gray-800 placeholder-gray-400 font-medium tracking-wide"
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
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={gotoForgotPassword}
            className="text-xs font-bold text-[#14919B] hover:underline"
          >
            Forgot?
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 mt-2 bg-[#14919B] hover:bg-[#11767e] text-white rounded-2xl font-main font-black uppercase tracking-wider text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Verifying Profile...</span>
          </>
        ) : (
          <span>Login</span>
        )}
      </button>

      <div className="flex flex-col items-center gap-4 mt-2">
        <div className="flex items-center w-full gap-3 my-1">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="font-main text-xs font-black text-gray-400 tracking-widest uppercase">
            Or Protocol
          </span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <div className="w-full flex justify-center">
          <GoogleButton />
        </div>

        <p className="font-main text-sm text-gray-500 font-medium mt-2">
          Don&apos;t have an account yet?{" "}
          <button
            type="button"
            onClick={gotoRegister}
            className="cursor-pointer font-bold text-[#14919B] hover:underline bg-transparent border-none p-0 outline-hidden"
          >
            Create Account
          </button>
        </p>
      </div>
    </form>
  );
}
