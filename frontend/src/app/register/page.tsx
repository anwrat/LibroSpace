'use client';
import LandingNav from "@/components/Navbar/LandingNav";
import Image from "next/image";

export default function Register(){
    return(
        <div className="flex min-h-screen items-center justify-center bg-white">
            <LandingNav />
            {/* Image and form section */}
            <div>
                <Image
                className=""
                src="/Register/boyundertree.png"
                alt="Boy Under Tree"
                width={700}
                height={20}
                priority
                />
            </div>
        </div>
    )
}