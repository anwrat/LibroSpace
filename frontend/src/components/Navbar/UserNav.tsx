'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { 
  Search, User, UserPlus, LogOut, MessageCircleMore, 
  Bell, Quote, SwatchBook, Book, Users, Loader2 
} from 'lucide-react';

import { useAuthContext } from "@/context/AuthContext";
import { 
  getPendingFriendRequests, 
  getUnreadStatus, 
  getUserFriendChallenges, 
  getSwapRequests,
  getGlobalSearchResults 
} from '@/lib/user'; 

export default function UserNav() {
  const { user, loading, logout } = useAuthContext();
  const pathname = usePathname();
  
  // UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{books: any[], users: any[], communities: any[]} | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Notification States
  const [pendingFriendRequests, setPendingFriendRequests] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [swapNotificationCount, setSwapNotificationCount] = useState(0); 
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- FETCH INITIAL NAV DATA ---
  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    try {
      const [reqData, msgData, challengeData, swapData] = await Promise.all([
        getPendingFriendRequests(),
        getUnreadStatus(),
        getUserFriendChallenges(),
        getSwapRequests()
      ]);

      setPendingFriendRequests(reqData.data.pendingRequests?.length || 0);
      setHasUnreadMessages(pathname !== "/user/friends/messages" ? msgData.data.hasUnread : false);

      const pendingChallenges = (challengeData.data.data || []).filter(
        (c: any) => c.status === 'pending' && c.challenged_id === user.id
      ).length;
      setNotificationCount(pendingChallenges);

      const pendingReceived = (swapData.data.data.received || []).filter((s: any) => s.status === 'pending').length;
      const acceptedResponses = (swapData.data.data.sent || []).filter((s: any) => s.status === 'accepted').length;
      setSwapNotificationCount(pendingReceived + acceptedResponses);

    } catch (err) {
      console.error("Error fetching nav data: ", err);
    }
  }, [user, pathname]);

  useEffect(() => {
    fetchInitialData();
  }, [pathname, fetchInitialData]);

  // --- SEARCH DEBOUNCE LOGIC ---
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await getGlobalSearchResults(searchQuery);
        setSearchResults(res.data.data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    if (!user) return;

    const socket = io(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000", {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on("receive_message", () => {
      if (pathname !== "/user/friends/messages") setHasUnreadMessages(true);
    });

    socket.on("receive_challenge", (data) => {
      setNotificationCount(prev => prev + 1);
      toast.success(data.message || "New challenge received!");
    });

    socket.on("receive_book_request", (data) => {
      setSwapNotificationCount(prev => prev + 1);
      toast.success(`New swap request for ${data.bookTitle}!`, { icon: '📚' });
    });

    socket.on("receive_swap_update", (data) => {
      if (data.status === 'accepted') {
        setSwapNotificationCount(prev => prev + 1);
        toast.success(data.message, { icon: '✅' });
      }
    });

    return () => { socket.disconnect(); };
  }, [user, pathname]);

  // --- CLICK OUTSIDE HANDLERS ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalNotifications = notificationCount + swapNotificationCount;

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname === href;
    return (
      <Link href={href} className={`relative py-1 text-sm font-bold transition-colors duration-300 group ${active ? 'text-[#14919B]' : 'text-gray-500 hover:text-[#14919B]'}`}>
        {children}
        <span className={`absolute left-0 bottom-0 h-0.5 bg-[#14919B] transition-all duration-300 ease-in-out ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-8 font-main">
        <div className="flex items-center justify-between h-full w-full gap-6">
          
          {/* LOGO */}
          <div className="shrink-0">
            <Link href="/user">
              <Image src="/Logo/Logonobgcropped.png" width={45} height={45} alt="Logo" className="rounded-xl hover:scale-105 transition-transform" />
            </Link>
          </div>

          {/* CENTER: SEARCH & NAV LINKS */}
          <div className="flex flex-1 items-center justify-center max-w-3xl gap-10">
            <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
              <div className="relative">
                {isSearching ? (
                  <Loader2 className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#14919B] animate-spin'/>
                ) : (
                  <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400'/>
                )}
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, users, clubs..." 
                  className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-sm focus:ring-2 focus:ring-[#14919B]/20 focus:border-[#14919B] outline-none transition-all font-medium" 
                />
              </div>

              {/* SEARCH DROPDOWN */}
              {searchResults && (
                <div className="absolute top-full left-0 w-full mt-3 bg-white border border-gray-100 rounded-[2rem] shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="max-h-[400px] overflow-y-auto p-2">
                    
                    {searchResults.books.length > 0 && (
                      <div className="mb-2">
                        <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Books</p>
                        {searchResults.books.map(book => (
                          <Link key={book.id} href={`/user/explore/${book.id}`} onClick={() => setSearchResults(null)} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-2xl transition-colors">
                            <div className="relative h-12 w-8 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                              <Image src={book.cover_url || '/Placeholders/book-placeholder.png'} alt="" fill className="object-cover" />
                            </div>
                            <span className="text-sm font-bold text-gray-800">{book.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.communities.length > 0 && (
                      <div className="mb-2 border-t border-gray-50 pt-2">
                        <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Communities</p>
                        {searchResults.communities.map(com => (
                          <Link key={com.id} href={`/user/community/${com.id}`} onClick={() => setSearchResults(null)} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-2xl transition-colors">
                            <div className="h-10 w-10 bg-[#14919B]/10 rounded-xl flex items-center justify-center text-[#14919B]">
                               <Users size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-800">{com.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.users.length > 0 && (
                      <div className="border-t border-gray-50 pt-2">
                        <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Readers</p>
                        {searchResults.users.map(u => (
                          <Link key={u.id} href={`/user/profile/${u.id}`} onClick={() => setSearchResults(null)} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-2xl transition-colors">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 border border-gray-100">
                               {u.picture_url ? <Image src={u.picture_url} alt="" width={40} height={40} /> : <User size={20} className="m-2 text-gray-400"/>}
                            </div>
                            <span className="text-sm font-bold text-gray-800">{u.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {Object.values(searchResults).every(arr => arr.length === 0) && (
                      <div className="p-10 text-center text-gray-400 text-sm font-bold italic">
                        No matches found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <NavLink href="/user/explore">Explore</NavLink>
              <NavLink href="/user/stats">Stats</NavLink>
              <NavLink href="/user/challenges">Challenges</NavLink>
              <NavLink href="/user/events">Events</NavLink>
              <NavLink href="/user/community">Community</NavLink>
            </div>
          </div>

          {/* RIGHT: USER PROFILE DROPDOWN */}
          <div className="flex items-center gap-4 shrink-0 relative" ref={dropdownRef}>
            {loading ? (
              <div className="h-11 w-11 bg-gray-100 animate-pulse rounded-2xl" />
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className={`relative flex items-center justify-center h-11 w-11 rounded-2xl border-2 transition-all overflow-hidden ${isDropdownOpen ? 'border-[#14919B] scale-95 shadow-inner' : 'border-transparent bg-gray-100 hover:bg-gray-200'}`}
                >
                  {user.picture_url ? <Image src={user.picture_url} alt="User" width={44} height={44} className="object-cover" /> : <User className="text-[#14919B]" size={22} />}
                  
                  {/* Global Notification Dot */}
                  {(pendingFriendRequests > 0 || totalNotifications > 0 || hasUnreadMessages) && (
                    <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-white animate-bounce" />
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-72 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl py-4 z-50 animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-gray-50 mb-2">
                      <p className="text-sm font-black text-gray-900 truncate">{user.name}</p>
                      <p className="text-[11px] font-bold text-gray-400 truncate uppercase tracking-tighter">{user.email}</p>
                    </div>
                    
                    <div className="px-2 space-y-1">
                      <DropdownItem href="/user/notifications" icon={Bell} label="Notifications" count={totalNotifications} onClick={() => setIsDropdownOpen(false)} />
                      <DropdownItem href="/user/profile" icon={User} label="My Profile" onClick={() => setIsDropdownOpen(false)} />
                      <DropdownItem href="/user/friends/messages" icon={MessageCircleMore} label="Messages" count={hasUnreadMessages ? "NEW" : 0} onClick={() => setIsDropdownOpen(false)} />
                      <DropdownItem href="/user/friends/requests" icon={UserPlus} label="Friend Requests" count={pendingFriendRequests} onClick={() => setIsDropdownOpen(false)} />
                      <DropdownItem href="/user/profile/shelf" icon={SwatchBook} label="My Shelves" onClick={() => setIsDropdownOpen(false)} />
                      <DropdownItem href="/user/profile/quotes" icon={Quote} label="Saved Quotes" onClick={() => setIsDropdownOpen(false)} />
                      
                      <button 
                        onClick={() => { setIsDropdownOpen(false); setShowLogoutConfirm(true); }} 
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-colors mt-2"
                      >
                        <LogOut size={18} />
                        Logout Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="px-7 py-3 text-sm font-black text-white bg-[#14919B] rounded-2xl hover:shadow-lg hover:shadow-[#14919B]/20 transition-all">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[3rem] max-w-sm w-full p-10 shadow-2xl animate-in zoom-in-90 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <LogOut className="text-red-500" size={36} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight italic">Leaving So Soon?</h3>
              <p className="text-gray-500 mb-10 font-bold text-sm leading-relaxed">Your books will miss you. Are you sure you want to end this session?</p>
              <div className="flex w-full gap-4">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-4 border-2 border-gray-100 rounded-2xl text-sm font-black text-gray-600 hover:bg-gray-50 transition-all">Stay</button>
                <button onClick={logout} className="flex-1 px-4 py-4 bg-red-500 text-white rounded-2xl text-sm font-black hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Sub-component for clean dropdown items
function DropdownItem({ href, icon: Icon, label, count, onClick }: any) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center justify-between px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-[1.5rem] transition-colors group">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-gray-400 group-hover:text-[#14919B] transition-colors" />
        {label}
      </div>
      {count && count !== 0 && (
        <span className={`${count === 'NEW' ? 'bg-[#14919B] animate-pulse' : 'bg-red-500'} text-white text-[9px] font-black px-2 py-0.5 rounded-full`}>
          {count}
        </span>
      )}
    </Link>
  );
}