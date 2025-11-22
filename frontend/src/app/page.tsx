'use client';
import Image from "next/image";
import LandingNav from "@/components/Navbar/LandingNav";
import RegisterEmailButton from "@/components/Buttons/RegisterEmailButton";
import {motion} from 'framer-motion';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <LandingNav />
      <main className="flex min-h-screen w-full max-w-3xl flex-row items-center justify-between py-32 px-16 bg-white sm:items-start">
        {/* Images section */}
        <motion.div initial={{y:-100, opacity:0}} animate={{opacity:1,y:0}}>
          <Image
            className=""
            src="/Landing/centreguy.png"
            alt="Center Guy"
            width={700}
            height={20}
            priority
          />
          <Image
            className=""
            src="/Landing/girl1.png"
            alt="Girl 1"
            width={100}
            height={20}
            priority
          />
          <Image
            className=""
            src="/Landing/girl2.png"
            alt="Girl 2"
            width={100}
            height={20}
            priority
          />
          <Image
            className=""
            src="/Landing/guy1.png"
            alt="Guy 2"
            width={100}
            height={20}
            priority
          />

        </motion.div>
        {/* Text and Register Section */}
        <div>
          {/* font-main uses Inter font */}
          <h1 className="text-5xl font-semibold font-main">Because books are better when shared!</h1>
          <p className="italic text-xl font-main">Track your reads, join discussions and celebrate the joy of reading</p>
          <RegisterEmailButton />
        </div>
      </main>
    </div>
  );
}
