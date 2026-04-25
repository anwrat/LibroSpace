'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginButton from "@/components/Buttons/LoginButton";

interface LandingNavProps {
    showLoginButton?: boolean;
}

export default function LandingNav({ showLoginButton = true }: LandingNavProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    // Add shadow and blur when user scrolls
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 flex justify-center p-4">
            <div 
                className={`
                    w-full max-w-6xl flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300
                    ${isScrolled 
                        ? "bg-white/80 backdrop-blur-md shadow-lg border border-gray-100 py-2" 
                        : "bg-transparent"}
                `}
            >
                {/* Logo Section */}
                <Link href="/" className="flex flex-row items-center gap-3 group cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl transition-transform group-hover:scale-110">
                        <Image 
                            src="/Logo/Logonobgcropped.png" 
                            width={40} 
                            height={40} 
                            alt="LibroSpace Logo"
                            className="object-contain"
                        />
                    </div>
                    <p className="font-main font-black text-xl tracking-tight text-gray-900">
                        Libro<span className="text-[#14919B]">Space</span>
                    </p>
                </Link>

                {/* Right Side: Action */}
                <div className="flex items-center gap-4">
                    {showLoginButton && (
                        <div className="hover:scale-105 transition-transform active:scale-95">
                            <LoginButton />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}