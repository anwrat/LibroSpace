'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from "@/context/AuthContext";
import Image from 'next/image';
import { Search, User, UserPlus, LogOut, X, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getPendingFriendRequests } from '@/lib/user';

export default function UserNav() {
  const { user, loading, logout } = useAuthContext();
  console.log(user);
  const pathname = usePathname();
  
  // State for UI toggles
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Ref to detect clicks outside the dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <span className={`absolute left-0 bottom-0 h-0.5 bg-[#14919B] transition-all duration-300 ease-in-out
            ${active ? 'w-full' : 'w-0 group-hover:w-full'}
        `} />
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-50 px-6 font-main">
        <div className="flex items-center justify-between h-full w-full gap-4">
          
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/user" className="flex items-center">
              <Image src="/Logo/Logonobgcropped.png" width={40} height={40} alt="Logo" className="rounded-lg" />
            </Link>
          </div>

          {/* Search & Links */}
          <div className="flex flex-1 items-center justify-center max-w-2xl gap-8">
            <div className="relative w-full hidden md:block">
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400'/>
              <input
                type="text"
                placeholder="Search books, users..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 text-sm focus:ring-2 focus:ring-[#14919B] outline-none transition-all"
              />
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <NavLink href="/user/explore">Explore</NavLink>
              <NavLink href="/stats">Stats</NavLink>
              <NavLink href="/challenges">Challenges</NavLink>
              <NavLink href="/community">Community</NavLink>
            </div>
          </div>

          {/* Right Side: Profile & Dropdown */}
          <div className="flex items-center gap-4 shrink-0 relative" ref={dropdownRef}>
            {loading ? (
              <div className="h-10 w-10 bg-gray-100 animate-pulse rounded-full" />
            ) : user ? (
              <div className="relative">
                {/* Profile Circle */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-transparent hover:border-[#14919B] bg-gray-100 overflow-hidden transition-all focus:outline-none cursor-pointer"
                >
                  {user.picture_url ? (
                    <Image src={user.picture_url} alt="User" width={40} height={40} className="object-cover" />
                  ) : (
                    <User className="text-[#14919B]" size={20} />
                  )}
                </button>

                {/* Popover Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <Link 
                        href="/user/friends" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <UserPlus size={18} className="text-gray-400" />
                        Friend Requests
                      </Link>
                      
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2 text-sm font-medium text-white bg-[#14919B] rounded-full">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <LogOut className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out?</h3>
              <p className="text-gray-500 mb-8">Are you sure you want to log out? You will need to sign back in to access your library.</p>
              
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={logout}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}