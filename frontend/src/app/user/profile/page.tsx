'use client';

import { useEffect, useState } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { useAuthContext } from "@/context/AuthContext";
import { getAllFriends } from "@/lib/user";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Calendar, Users, ArrowRight, Star, ShieldCheck } from "lucide-react";

interface Friend {
  id: number;
  name: string;
  picture_url?: string;
}

export default function UserProfile() {
  const { user, loading: authLoading } = useAuthContext();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Calculate XP Percentage
  const xpPercentage = user ? Math.min(Math.floor((user.xp / user.next_level_xp) * 100), 100) : 0;

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.id) return;
      try {
        const data = await getAllFriends();
        setFriends(data.data.friends || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchFriends();
  }, [user]);

  if (authLoading) return <div className="min-h-screen bg-gray-50 animate-pulse" />;

  const joinedDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Recently";

  return (
    <div className="min-h-screen bg-gray-50 font-main">
      <UserNav />

      <main className="max-w-5xl mx-auto pt-28 pb-12 px-6">
        
        {/* --- PROFILE HEADER --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#14919B]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
            {/* Avatar Section with Level Badge */}
            <div className="relative h-40 w-40 shrink-0">
              <div className="h-full w-full rounded-[2.5rem] bg-gray-100 overflow-hidden border-4 border-white shadow-xl relative">
                {user?.picture_url ? (
                  <Image src={user.picture_url} alt="Profile" fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[#14919B]">
                    <User size={64} />
                  </div>
                )}
              </div>
              {/* Level Floating Badge */}
              <div className="absolute -bottom-3 -right-3 bg-[#14919B] text-white px-4 py-2 rounded-2xl shadow-lg border-4 border-white font-black text-xl flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-tighter opacity-80">Lv</span>
                {user?.level || 1}
              </div>
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user?.name}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                      <Mail size={14} className="text-[#14919B]" />
                      {user?.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                      <Calendar size={14} className="text-[#14919B]" />
                      Joined {joinedDate}
                    </div>
                  </div>
                </div>
                
                {/* XP Summary for Desktop */}
                <div className="hidden lg:block text-right">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Current Progress</p>
                  <p className="text-2xl font-black text-[#14919B]">
                    {user?.xp} <span className="text-gray-300">/</span> {user?.next_level_xp} <span className="text-sm text-gray-400 font-bold ml-1">XP</span>
                  </p>
                </div>
              </div>

              {/* --- XP BAR SECTION --- */}
              <div className="w-full">
                <div className="flex justify-between items-end mb-2">
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Level: {user?.level}</span>
                   </div>
                   <span className="text-xs font-bold text-gray-400 italic">{user?.next_level_xp??100 - (user?.xp || 0)} XP to next level</span>
                </div>
                
                {/* The Progress Bar */}
                <div className="h-5 w-full bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-100">
                  <div 
                    className="h-full bg-linear-to-r from-[#14919B] to-[#14c3d1] rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_15px_rgba(20,145,155,0.3)]"
                    style={{ width: `${xpPercentage}%` }}
                  >
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-white/20 w-full h-[50%] rounded-full" />
                  </div>
                </div>
                
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[11px] font-bold text-gray-400">Level {user?.level}</span>
                  <span className="text-[11px] font-bold text-gray-400">Level {(user?.level || 1) + 1}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FRIENDS PREVIEW SECTION --- */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#14919B]/10 rounded-xl text-[#14919B]">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Connections</h2>
                <p className="text-xs text-gray-400 font-medium">Build your network</p>
              </div>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-1 rounded-md ml-2 border border-gray-200">
                {friends.length}
              </span>
            </div>
            
            <Link 
              href="/user/friends" 
              className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#14919B] hover:text-white transition-all shadow-sm"
            >
              View Directory <ArrowRight size={14} />
            </Link>
          </div>

          {loadingFriends ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : friends.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {friends.slice(0, 6).map((friend) => (
                <Link href={`/user/profile/${friend.id}`} key={friend.id} className="flex flex-col items-center group">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden relative mb-3 border-2 border-transparent group-hover:border-[#14919B] transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1">
                    {friend.picture_url ? (
                      <Image src={friend.picture_url} alt={friend.name} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-700 truncate w-full text-center group-hover:text-[#14919B] transition-colors">
                    {friend.name.split(' ')[0]}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium">No connections yet.</p>
              <Link href="/user/explore" className="text-[#14919B] text-xs font-bold mt-2 inline-block bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                Discover Readers
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}