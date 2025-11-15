'use client';
import Image from "next/image";
import LoginButton from "@/components/Buttons/LoginButton";

export default function LandingNav(){
    return(
        <nav>
        <Image src="/Logo/Logonobg.png" width={100} height={20} alt="LibroSpace Logo"></Image>
        <LoginButton />
        </nav>
    )
}