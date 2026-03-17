'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthContext } from "@/context/AuthContext";
import Image from 'next/image';
import { Search, User, UserPlus, LogOut, MessageCircleMore, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getPendingFriendRequests, getUnreadStatus, getUserFriendChallenges } from '@/lib/user'; 
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";

export default function UserNav() {
  const { user, loading, logout } = useAuthContext();
  const pathname = usePathname();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Separate notification states
  const [pendingFriendRequests, setPendingFriendRequests] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0); // For Challenges
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch Friend Requests
      const reqData = await getPendingFriendRequests();
      setPendingFriendRequests(reqData.data.pendingRequests.length);

      // 2. Fetch Unread Messages
      if (pathname !== "/user/friends/messages") {
        const msgData = await getUnreadStatus();
        setHasUnreadMessages(msgData.data.hasUnread);
      }

      // Fetch Pending Challenges for the Notification Bell only for receiver
      const challengeData = await getUserFriendChallenges();
      const pendingChallenges = (challengeData.data.data || []).filter((c: any) => c.status === 'pending' && c.challenged_id === user.id);
      setNotificationCount(pendingChallenges.length);

    } catch (err) {
      console.error("Error fetching nav data: ", err);
    }
  }, [user, pathname]);

  useEffect(() => {
    fetchInitialData();
  }, [pathname, fetchInitialData]);

  useEffect(() => {
    if (!user) return;

    const socket = io(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000", {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on("receive_message", () => {
      if (pathname !== "/user/friends/messages") setHasUnreadMessages(true);
    });

    // Handle Challenge Notifications
    socket.on("receive_challenge", (data) => {
      // Increment notification count (Bell)
      setNotificationCount(prev => prev + 1);
      toast.success(data.message || "New challenge received!");
    });

    return () => { socket.disconnect(); };
  }, [user, pathname]);

  // Close dropdown on outside click
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
      <Link href={href} className={`relative py-1 text-sm font-medium transition-colors duration-300 group ${active ? 'text-[#14919B]' : 'text-gray-600 hover:text-[#14919B]'}`}>
        {children}
        <span className={`absolute left-0 bottom-0 h-0.5 bg-[#14919B] transition-all duration-300 ease-in-out ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-50 px-6 font-main">
        <div className="flex items-center justify-between h-full w-full gap-4">
          <div className="shrink-0">
            <Link href="/user">
              <Image src="/Logo/Logonobgcropped.png" width={40} height={40} alt="Logo" className="rounded-lg" />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center max-w-2xl gap-8">
            <div className="relative w-full hidden md:block">
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400'/>
              <input type="text" placeholder="Search books, users..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 text-sm focus:ring-2 focus:ring-[#14919B] outline-none" />
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <NavLink href="/user/explore">Explore</NavLink>
              <NavLink href="/user/stats">Stats</NavLink>
              <NavLink href="/user/challenges">Challenges</NavLink>
              <NavLink href="/user/events">Events</NavLink>
              <NavLink href="/user/community">Community</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 relative" ref={dropdownRef}>
            {loading ? (
              <div className="h-10 w-10 bg-gray-100 animate-pulse rounded-full" />
            ) : user ? (
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="relative flex items-center justify-center h-10 w-10 rounded-full border-2 border-transparent hover:border-[#14919B] bg-gray-100 overflow-hidden transition-all">
                  {user.picture_url ? <Image src={user.picture_url} alt="User" width={40} height={40} className="object-cover" /> : <User className="text-[#14919B]" size={20} />}
                </button>

                {/* GLOBAL RED DOT: Show if ANY notification type exists */}
                {(pendingFriendRequests > 0 || notificationCount > 0 || hasUnreadMessages) && (
                  <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                )}

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <div className="py-2">
                      {/* Notifications Link with its own badge */}
                      <Link href="/user/notifications" onClick={() => setIsDropdownOpen(false)} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Bell size={18} className="text-gray-400" />
                          Notifications
                        </div>
                        {notificationCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {notificationCount}
                          </span>
                        )}
                      </Link>

                      <Link href="/user/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={18} className="text-gray-400" />
                        Profile
                      </Link>

                      <Link href="/user/friends/messages" onClick={() => setIsDropdownOpen(false)} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <MessageCircleMore size={18} className="text-gray-400" />
                          Messages
                        </div>
                        {hasUnreadMessages && <span className="bg-[#14919B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-bounce">NEW</span>}
                      </Link>

                      <Link href="/user/friends/requests" onClick={() => setIsDropdownOpen(false)} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <UserPlus size={18} className="text-gray-400" />
                          Friend Requests
                        </div>
                        {pendingFriendRequests > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {pendingFriendRequests}
                          </span>
                        )}
                      </Link>
                      
                      <button onClick={() => { setIsDropdownOpen(false); setShowLogoutConfirm(true); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2 text-sm font-medium text-white bg-[#14919B] rounded-full">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Modal*/}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <LogOut className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out?</h3>
              <p className="text-gray-500 mb-8">Are you sure you want to log out?</p>
              <div className="flex w-full gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Cancel</button>
                <button onClick={logout} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}