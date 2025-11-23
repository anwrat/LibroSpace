'use client';
import LandingNav from "@/components/Navbar/LandingNav";
import Image from "next/image";
import RegisterForm from "@/components/Forms/RegisterForm";
import {motion} from 'framer-motion';

export default function Register(){
    return(
        <div className="flex min-h-screen items-center justify-center bg-white">
            <LandingNav />
            {/* Image and form section */}
            <div className="w-full max-w-5xl flex flex-row items-center">
                <motion.div initial={{y:-100, opacity:0}} animate={{opacity:1,y:0}}>
                    <Image
                    className=""
                    src="/Register/boyundertree.png"
                    alt="Boy Under Tree"
                    width={500}
                    height={20}
                    priority
                    />
                </motion.div>
                <RegisterForm/>
            </div>
        </div>
    )
}