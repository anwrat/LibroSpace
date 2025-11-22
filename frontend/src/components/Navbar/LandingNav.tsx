'use client';
import Image from "next/image";
import LoginButton from "@/components/Buttons/LoginButton";

export default function LandingNav(){
    return(
        <div className="flex items-center fixed top-2 w-full max-w-6xl justify-between">
            <div className="flex flex-row items-center gap-3">
                <Image src="/Logo/Logonobgcropped.png" width={50} height={20} alt="LibroSpace Logo"></Image>
                <p className="font-main font-bold">LibroSpace</p>
            </div>
            <LoginButton />
        </div>
    )
}