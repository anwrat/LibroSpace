'use client';
import Link from 'next/link';
import { useAuthContext } from "@/context/AuthContext"; 
import Image from 'next/image';

export default function UserNav() {
  const { user, loading, logout } = useAuthContext();

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-50 px-6">
      <div className="flex items-center justify-between h-full w-full gap-4">
        
        {/* Left Side: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center">
            <Image src="/Logo/Logonobgcropped.png" 
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
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search books, projects..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/dashboard" className="hover:text-blue-600 transition">Explore</Link>
            <Link href="/projects" className="hover:text-blue-600 transition">Projects</Link>
          </div>
        </div>

        {/* Right Side: Auth Status */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {loading ? (
            <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-full" />
          ) : user ? (
            <>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold leading-none">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button 
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}