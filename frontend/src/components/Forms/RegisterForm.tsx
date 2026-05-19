'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import GoogleButton from "../Buttons/GoogleButton";
import { registerUser } from "@/lib/auth";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setconfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const gotoLogin = () => {
    router.push('/login');
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (password !== confirmPassword) {
      toast.error("Security confirmation key mismatch. Passwords must match exactly.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({ name, email, password });
      toast.success("Account created! Redirecting to verification protocol...");
      
      // Navigate to verification checkpoint
      window.location.href = `/register/verify?sessionId=${res.data?.sessionId}`;
    } catch (err: any) {
      console.error("Registration failed", err);
      toast.error(err.response?.data?.message || "Registration failed. This email or username may already be in use.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-5 w-full">
      <Toaster position="top-center" />

      <div>
        <h1 className="font-main font-black text-4xl text-gray-900 tracking-tight">Sign Up</h1>
        <p className="text-gray-400 text-sm font-medium mt-1.5">Begin syncing your personal library catalog today.</p>
      </div>

      {/* Username Field */}
      <div className="flex flex-col gap-1.5 mt-2">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus-within:border-[#14919B] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14919B]/10 transition-all duration-200 group">
          <User size={18} className="text-gray-400 group-focus-within:text-[#14919B] transition-colors" />
          <input 
            type="text" 
            placeholder="Choose a username" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            disabled={isSubmitting}
            className="w-full font-main text-sm bg-transparent border-none outline-hidden text-gray-800 placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus-within:border-[#14919B] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14919B]/10 transition-all duration-200 group">
          <Mail size={18} className="text-gray-400 group-focus-within:text-[#14919B] transition-colors" />
          <input 
            type="email" 
            placeholder="Enter your email address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={isSubmitting}
            className="w-full font-main text-sm bg-transparent border-none outline-hidden text-gray-800 placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus-within:border-[#14919B] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14919B]/10 transition-all duration-200 group">
          <Lock size={18} className="text-gray-400 group-focus-within:text-[#14919B] transition-colors" />
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Create your security password" 
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
      </div>

      {/* Confirm Password Field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus-within:border-[#14919B] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14919B]/10 transition-all duration-200 group">
          <Lock size={18} className="text-gray-400 group-focus-within:text-[#14919B] transition-colors" />
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="Re-type your chosen password" 
            value={confirmPassword} 
            onChange={(e) => setconfirmPassword(e.target.value)} 
            required 
            disabled={isSubmitting}
            className="w-full font-main text-sm bg-transparent border-none outline-hidden text-gray-800 placeholder-gray-400 font-medium tracking-wide"
          />
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Custom Tailwinds Action Submission Button alternative */}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-4 px-6 mt-3 bg-[#14919B] hover:bg-[#11767e] text-white rounded-2xl font-main font-black uppercase tracking-wider text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Registering...</span>
          </>
        ) : (
          <span>Register</span>
        )}
      </button>

      {/* Alternative Social Integrations Platform Section */}
      <div className="flex flex-col items-center gap-4 mt-1">
        <div className="flex items-center w-full gap-3 my-1">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="font-main text-xs font-black text-gray-400 tracking-widest uppercase">Or Register</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
        
        <div className="w-full flex justify-center">
          <GoogleButton />
        </div>

        <p className="font-main text-sm text-gray-500 font-medium mt-1">
          Already have an account?{" "}
          <button 
            type="button"
            onClick={gotoLogin} 
            className="cursor-pointer font-bold text-[#14919B] hover:underline bg-transparent border-none p-0 outline-hidden"
          >
            Login Here
          </button>
        </p>
      </div>
    </form>
  );
}