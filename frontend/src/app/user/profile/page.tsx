'use client';

import { useEffect, useState } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { useAuthContext } from "@/context/AuthContext";
import { getAllFriends } from "@/lib/user";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Calendar, Users, ArrowRight } from "lucide-react";

interface Friend {
  id: number;
  name: string;
  picture_url?: string;
}

export default function UserProfile() {
  const { user, loading: authLoading } = useAuthContext();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

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
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <div className="relative h-32 w-32 shrink-0">
            <div className="h-full w-full rounded-full bg-gray-100 overflow-hidden border-4 border-[#14919B]/10 relative">
              {user?.picture_url ? (
                <Image src={user.picture_url} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[#14919B]">
                  <User size={48} />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                <Mail size={16} className="text-[#14919B]" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                <Calendar size={16} className="text-[#14919B]" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- FRIENDS PREVIEW SECTION --- */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="text-[#14919B]" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Friends</h2>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full ml-2">
                {friends.length}
              </span>
            </div>
            
            {friends.length > 6 && (
              <Link 
                href="/user/friends" 
                className="text-[#14919B] text-sm font-semibold flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {loadingFriends ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : friends.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {/* Only show the first 6 friends as a preview */}
              {friends.slice(0, 6).map((friend) => (
                <div key={friend.id} className="flex flex-col items-center group cursor-pointer">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden relative mb-2 border border-gray-100 transition-transform group-hover:scale-105">
                    {friend.picture_url ? (
                      <Image src={friend.picture_url} alt={friend.name} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-700 truncate w-full text-center">
                    {friend.name.split(' ')[0]}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm italic">You haven't added any friends yet.</p>
              <Link href="/user/explore" className="text-[#14919B] text-xs font-bold mt-2 inline-block">
                Find people to follow
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}