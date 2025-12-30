'use client';
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { logOut } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function AdminNav(){
    const router = useRouter();
    const pathname = usePathname(); 
    const [showLogOutConfirm, setShowLogOutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const handleClick = (path: string) => {
        router.push('/admin/' + path);
    }

    const confirmLogOut = async() =>{
        setIsLoggingOut(true);
        try{
            await logOut();
            router.push('/');
        }catch(err){
            console.log("LogOut failed: ",err);
            setIsLoggingOut(false);
        }
    }
    
    // Check if menu item is active
    const isActive = (path: string) => {
        return pathname === `/admin/${path}`;
    }
    
    const menuItems = [
        { label: 'Users', path: 'users' },
        { label: 'Books', path: 'books' },
        { label: 'Community', path: 'community' },
        { label: 'Reports', path: 'reports' }
    ];
    
    return(
        <>
        <div className="flex items-center fixed top-2 left-4 max-w-6xl flex-col gap-20">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
                <Image 
                    src="/Logo/Logonobgcropped.png" 
                    width={50} 
                    height={20} 
                    alt="LibroSpace Logo"
                />
                <p className="font-main font-bold">LibroSpace</p>
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex flex-col gap-5">
                {menuItems.map((item) => (
                    <p
                        key={item.path}
                        className={`
                            font-main cursor-pointer transition-colors
                            ${isActive(item.path) 
                                ? 'text-[#14919B] font-semibold' 
                                : 'text-gray-700 hover:text-[#14919B]'
                            }
                        `}
                        onClick={() => handleClick(item.path)}
                    >
                        {item.label}
                    </p>
                ))}
            </nav>
            <LogOut className="cursor-pointer bottom-0" onClick={()=>{setShowLogOutConfirm(true)}}/>
        </div>
        {showLogOutConfirm &&(
            <>
                {/* The black transparent bg for dimming effect */}
                <div className="fixed flex items-center inset-0 z-40 bg-black opacity-50 justify-center" onClick={()=>{setShowLogOutConfirm(false)}}/>
                {/* The confirmation dialog */}
                <div className="fixed bg-white rounded-lg shadow-xl bg-opacity-100 z-50">
                    <p className="font-main">Are you sure you want to log out?</p>
                    <div className="flex justify-center gap-6">
                        <button 
                            className="cursor-pointer font-main bg-red-500 px-6 py-2 hover:bg-red-700" 
                            onClick={confirmLogOut} 
                            disabled={isLoggingOut}>
                                {isLoggingOut? 'Logging Out...': 'LogOut'}
                        </button>
                        <button 
                            className="cursor-pointer font-main px-6 py-2 bg-gray-30 hover:bg-gray-400" 
                            onClick={()=>{setShowLogOutConfirm(false)}} 
                            disabled={isLoggingOut}>
                                Cancel
                        </button>
                    </div>
                </div>
            </>
        )}
        </>
    );
}