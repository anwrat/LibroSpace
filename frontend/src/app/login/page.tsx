'use client';
import Image from "next/image";
import LandingNav from "@/components/Navbar/LandingNav";
import LoginForm from "@/components/Forms/LoginForm";

export default function Login(){
    return(
        <div className="flex min-h-screen items-center justify-center bg-white">
            <LandingNav />
            <div className="w-full max-w-5xl flex flex-row items-center gap-20">
                <Image src='/Login/girl.png' alt='Girl reading book' width={400} height={200}/>
                <LoginForm/>
            </div>
        </div>
    )
}