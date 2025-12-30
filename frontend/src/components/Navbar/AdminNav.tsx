'use client';
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { logOut } from "@/lib/auth";
import { 
    LogOut, 
    Users, 
    BookOpen, 
    MessageSquare, 
    Flag,
    ChevronLeft,
    ChevronRight 
} from "lucide-react";
import { useState } from "react";

export default function AdminNav(){
    const router = useRouter();
    const pathname = usePathname(); 
    const [showLogOutConfirm, setShowLogOutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [collapsed, setCollapsed] = useState(false); 
    
    const handleClick = (path: string) => {
        router.push('/admin/' + path);
    }

    const confirmLogOut = async() => {
        setIsLoggingOut(true);
        try {
            await logOut();
            router.push('/');
        } catch(err) {
            console.log("LogOut failed: ", err);
            setIsLoggingOut(false);
        }
    }
    
    const isActive = (path: string) => {
        return pathname === `/admin/${path}`;
    }
    
    const menuItems = [
        { label: 'Users', path: 'users', icon: Users },
        { label: 'Books', path: 'books', icon: BookOpen },
        { label: 'Community', path: 'community', icon: MessageSquare },
        { label: 'Reports', path: 'reports', icon: Flag }
    ];
    
    return(
        <>
        {/* Collapsible Sidebar */}
        <div className={`
            fixed top-0 left-0 h-screen bg-gradient-to-b from-[#14919B] to-[#0d6169] text-white
            shadow-2xl flex flex-col justify-between py-6 transition-all duration-300
            ${collapsed ? 'w-20' : 'w-64'}
        `}>
            {/* Header with collapse button */}
            <div>
                <div className="flex items-center justify-between px-4 mb-6">
                    {!collapsed && (
                        <div className="flex items-center gap-3">
                            <Image 
                                src="/Logo/Logonobgcropped.png" 
                                width={40} 
                                height={40} 
                                alt="LibroSpace Logo"
                                className="rounded-lg"
                            />
                            <p className="font-main font-bold text-lg">LibroSpace</p>
                        </div>
                    )}
                    {collapsed && (
                        <Image 
                            src="/Logo/Logonobgcropped.png" 
                            width={40} 
                            height={40} 
                            alt="LibroSpace Logo"
                            className="rounded-lg mx-auto"
                        />
                    )}
                </div>
                
                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full px-4 py-2 hover:bg-white/10 transition-colors flex items-center justify-center"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                
                <div className="w-full h-px bg-white/20 my-4" />
                
                {/* Navigation Menu */}
                <nav className="flex flex-col gap-1 px-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg
                                    cursor-pointer transition-all duration-200
                                    ${isActive(item.path) 
                                        ? 'bg-white text-[#14919B] shadow-lg scale-105' 
                                        : 'text-white/80 hover:bg-white/10'
                                    }
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                                onClick={() => handleClick(item.path)}
                                title={collapsed ? item.label : ''}
                            >
                                <Icon size={20} />
                                {!collapsed && <p className="font-main font-medium">{item.label}</p>}
                            </div>
                        );
                    })}
                </nav>
            </div>
            
            {/* Logout Button */}
            <button
                className={`
                    flex items-center gap-3 mx-2 px-4 py-3 rounded-lg
                    bg-red-500/20 hover:bg-red-500/30 transition-colors
                    ${collapsed ? 'justify-center' : ''}
                `}
                onClick={() => setShowLogOutConfirm(true)}
                title={collapsed ? 'Logout' : ''}
            >
                <LogOut size={20} />
                {!collapsed && <span className="font-main font-medium">Logout</span>}
            </button>
        </div>
        
        {/* Modal */}
        {showLogOutConfirm && (
            <>
                <div 
                    className="fixed inset-0 z-40 bg-black opacity-50 flex items-center justify-center backdrop-blur-sm"
                />
                
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 z-50 w-96">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-100 rounded-full">
                            <LogOut className="text-red-600" size={24} />
                        </div>
                        <h3 className="font-main font-bold text-xl">Confirm Logout</h3>
                    </div>
                    
                    <p className="font-main text-gray-600 mb-6">
                        Are you sure you want to logout? You'll need to sign in again to access the admin panel.
                    </p>
                    
                    <div className="flex justify-end gap-3">
                        <button 
                            className="px-6 py-2 rounded-lg font-main border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            onClick={() => setShowLogOutConfirm(false)} 
                            disabled={isLoggingOut}
                        >
                            Cancel
                        </button>
                        <button 
                            className="px-6 py-2 rounded-lg font-main bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 shadow-lg"
                            onClick={confirmLogOut} 
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Logging Out...
                                </span>
                            ) : (
                                'Logout'
                            )}
                        </button>
                    </div>
                </div>
            </>
        )}
        </>
    );
}