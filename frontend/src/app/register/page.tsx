'use client';

import Image from "next/image";
import LandingNav from "@/components/Navbar/LandingNav";
import RegisterForm from "@/components/Forms/RegisterForm";
import { motion } from 'framer-motion';

export default function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 sm:px-8 relative overflow-hidden">
      <LandingNav showLoginButton={false} />
      
      {/* Decorative background accent brand blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#14919B]/5 rounded-full -ml-20 -mt-20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#14c3d1]/5 rounded-full -mr-20 -mb-20 blur-3xl pointer-events-none" />

      <motion.div 
        className="w-full max-w-5xl bg-white rounded-[2.5rem] p-8 sm:p-12 md:p-16 border border-gray-100 shadow-xl flex flex-col md:flex-row items-center gap-12 lg:gap-20 relative z-10"
        initial={{ y: 40, opacity: 0 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Left Side Illustration - Collapses elegantly on mobile layouts */}
        <div className="hidden md:flex flex-1 justify-center items-center">
          <div className="relative w-full max-w-sm lg:max-w-md aspect-square">
            <Image
              src="/Register/boyundertree.png"
              alt="Illustration of a boy reading under a tree"
              fill
              priority
              className="object-contain animate-in fade-in zoom-in-95 duration-700"
            />
          </div>
        </div>

        {/* Right Side Registration Handling Module Component */}
        <div className="w-full md:flex-1 max-w-md mx-auto">
          <RegisterForm />
        </div>
      </motion.div>
    </div>
  );
}