'use client';
import Image from "next/image";
import LoginButton from "@/components/Buttons/LoginButton";

export default function LandingNav(){
    return(
        <div className="flex items-center fixed top-0 w-full max-w-4xl justify-between">
            <div>
                <Image src="/Logo/Logonobgcropped.png" width={50} height={20} alt="LibroSpace Logo"></Image>
                <p className="font-main">LibroSpace</p>
            </div>
            <LoginButton />
        </div>
    )
}