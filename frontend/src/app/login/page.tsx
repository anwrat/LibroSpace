'use client';
import Image from "next/image";
import LandingNav from "@/components/Navbar/LandingNav";
import LoginForm from "@/components/Forms/LoginForm";
import {motion} from 'framer-motion';

export default function Login(){
    return(
        <div className="flex min-h-screen items-center justify-center bg-white">
            <LandingNav showLoginButton={false}/>
            <motion.div className="w-full max-w-5xl flex flex-row items-center gap-20" initial={{y:-100, opacity:0}} animate={{opacity:1,y:0}}>
                <Image src='/Login/girl.png' alt='Girl reading book' width={400} height={200}/>
                <LoginForm/>
            </motion.div>
        </div>
    )
}