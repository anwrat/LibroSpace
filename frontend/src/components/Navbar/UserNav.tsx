'use client';

import Link from 'next/link';
import { useAuthContext } from "@/context/AuthContext";
import Image from 'next/image';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function UserNav() {
  const { user, loading, logout } = useAuthContext();
  const pathname = usePathname();

  // Helper component for navigation links
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={`relative py-1 text-sm font-medium transition-colors duration-300 group
          ${active ? 'text-[#14919B]' : 'text-gray-600 hover:text-[#14919B]'}
        `}
      >
        {children}
        {/* Animated Underline */}
        <span
          className={`absolute left-0 bottom-0 h-0.5 bg-[#14919B] transition-all duration-300 ease-in-out
            ${active ? 'w-full' : 'w-0 group-hover:w-full'}
          `}
        />
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-50 px-6 font-main">
      <div className="flex items-center justify-between h-full w-full gap-4">
        
        {/* Left Side: Logo */}
        <div className="shrink-0">
          <Link href="/user" className="flex items-center">
            <Image 
              src="/Logo/Logonobgcropped.png" 
              width={40} 
              height={40} 
              alt="LibroSpace Logo"
              className="rounded-lg"
            />
          </Link>
        </div>

        {/* Middle Section: Search Bar & Links */}
        <div className="flex flex-1 items-center justify-center max-w-2xl gap-8">
          {/* SEARCH BAR */}
          <div className="relative w-full hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className='h-4 w-4 text-gray-400'/>
            </div>
            <input
              type="text"
              placeholder="Search books, users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14919B] focus:border-transparent transition-all"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink href="/user/explore">Explore</NavLink>
            <NavLink href="/stats">Stats</NavLink>
            <NavLink href="/challenges">Challenges</NavLink>
            <NavLink href="/community">Community</NavLink>
          </div>
        </div>

        {/* Right Side: Auth Status */}
        <div className="flex items-center gap-4 shrink-0">
          {loading ? (
            <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-full" />
          ) : user ? (
            <>
              <Link href="/user/profile" className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
              </Link>
              <button 
                onClick={logout}
                className="px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className="px-5 py-2 text-sm font-medium text-white bg-[#14919B] rounded-full hover:bg-[#0f7178] transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}