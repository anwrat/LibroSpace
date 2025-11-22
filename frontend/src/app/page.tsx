'use client';
import Image from "next/image";
import LandingNav from "@/components/Navbar/LandingNav";
import RegisterEmailButton from "@/components/Buttons/RegisterEmailButton";
import {motion} from 'framer-motion';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <LandingNav />
      <main className="flex min-h-screen w-full max-w-5xl flex-row items-center gap-20 justify-between py-32 px-16 bg-white sm:items-start">
        {/* Images section */}
        <motion.div className="relative w-[700px] h-[550px] mx-auto" initial={{y:-100, opacity:0}} animate={{opacity:1,y:0}}>
          {/* Center Image */}
          <Image
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-15"
            src="/Landing/centreguy.png"
            alt="Center Guy"
            width={300}
            height={20}
            priority
          />
          <Image
            className="absolute top-22 left-4 rotate-28"
            src="/Landing/girl1.png"
            alt="Girl 1"
            width={100}
            height={20}
            priority
          />
          <Image
            className="absolute top-30 -right-10 rotate-13"
            src="/Landing/girl2.png"
            alt="Girl 2"
            width={100}
            height={20}
            priority
          />
          <Image
            className="absolute bottom-15 left-1/2 -translate-x-1/2 -rotate-9"
            src="/Landing/guy1.png"
            alt="Guy 2"
            width={120}
            height={20}
            priority
          />
        </motion.div>
        {/* Text and Register Section */}
        <div className="mt-30 flex flex-col items-center gap-5">
          {/* font-main uses Inter font */}
          <h1 className="text-5xl font-semibold font-main">Because books are better when shared!</h1>
          <p className="italic text-xl font-main">Track your reads, join discussions and celebrate the joy of reading</p>
          <RegisterEmailButton />
        </div>
      </main>
    </div>
  );
}
