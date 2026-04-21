'use client';
import Image from "next/image";
import LandingNav from "@/components/Navbar/LandingNav";
import RegisterEmailButton from "@/components/Buttons/RegisterEmailButton";
import { motion } from 'framer-motion';
import GoogleButton from "@/components/Buttons/GoogleButton";
import { Sword, Users, Trophy, BookOpen } from "lucide-react";
import Link from "next/link";

// Animation for the floating images
const floatingAnimation = (delay: number) => ({
  y: [0, -15, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
    delay
  }
});

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-main overflow-x-hidden">
      <LandingNav />
      
      {/* --- HERO SECTION --- */}
      <section className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between py-20 lg:py-32 px-8 lg:px-16 gap-16">
        
        {/* Left: Animated Orbiting Images */}
        <motion.div 
          className="relative w-full max-w-[500px] h-[500px]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative Circle Ring */}
          <div className="absolute inset-0 border border-dashed border-[#14919B]/20 rounded-full animate-[spin_60s_linear_infinite]" />
          
          {/* Center Main Image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div animate={floatingAnimation(0)}>
               <Image src="/Landing/centreguy.png" alt="Hero" width={280} height={280} className="drop-shadow-2xl rotate-[-5deg]" />
            </motion.div>
          </div>

          {/* Orbiting Elements */}
          {[
            { src: "/Landing/girl1.png", pos: "top-0 left-10", delay: 0.5, rot: 15 },
            { src: "/Landing/girl2.png", pos: "top-20 -right-5", delay: 1, rot: -10 },
            { src: "/Landing/guy1.png", pos: "bottom-10 left-20", delay: 1.5, rot: 5 },
          ].map((img, i) => (
            <motion.div 
              key={i}
              className={`absolute ${img.pos} z-20`}
              animate={floatingAnimation(img.delay)}
            >
              <Image src={img.src} alt="Reader" width={110} height={110} className={`rounded-2xl shadow-lg rotate-[${img.rot}deg] border-2 border-white`} />
            </motion.div>
          ))}
        </motion.div>

        {/* Right: Content */}
        <motion.div 
          className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6 max-w-xl"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1]">
            Books are better <br /> <span className="text-[#14919B]">when shared.</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-md">
            The social platform for readers. Track your progress, earn levels, and challenge friends in the ultimate literary arena.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
            <RegisterEmailButton />
            <GoogleButton />
          </div>
        </motion.div>
      </section>

      {/* --- FEATURES PREVIEW (Bento Grid) --- */}
      <section className="bg-gray-50 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Level Up Your Reading</h2>
            <p className="text-gray-500 font-medium">Everything you need to turn reading into an adventure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-[#14919B]/10 rounded-2xl flex items-center justify-center text-[#14919B] mb-6 group-hover:scale-110 transition-transform">
                <Trophy size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Gamified Progress</h3>
              <p className="text-gray-500 leading-relaxed">Earn XP for every page you read. Level up your profile and unlock exclusive badges and titles.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Community Hubs</h3>
              <p className="text-gray-500 leading-relaxed">Join book-specific communities. Contribute quotes, participate in discussions, and grow together.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
                <Sword size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Friend Challenges</h3>
              <p className="text-gray-500 leading-relaxed">Set reading goals and challenge your friends to real-time duels. Who can finish the book first?</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto bg-[#14919B] rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-[#14919B]/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">Ready to start your chapter?</h2>
            <p className="text-white/80 text-lg font-medium mb-10 max-w-lg mx-auto">
              Join 5,000+ readers who have already turned their bookshelves into a playground.
            </p>
            <div className="flex justify-center">
               <Link href="/register" className="bg-white text-[#14919B] px-10 py-4 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl">
                 Create Your Profile
               </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}