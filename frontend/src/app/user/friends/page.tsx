'use client';

import { useEffect, useState } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { getAllFriends, deleteFriendRequest } from "@/lib/user";
import Image from "next/image";
import { User, Search, UserMinus, MessageSquare } from "lucide-react";

interface Friend {
  id: number;
  name: string;
  email: string;
  picture_url?: string;
}

export default function AllFriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getAllFriends();
        setFriends(data.data.friends || []);
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  // Filter friends based on search input
  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnfriend = async (friendId: number) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;
    try {
      await deleteFriendRequest(friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (error) {
      alert("Failed to remove friend.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-main">
      <UserNav />

      <main className="max-w-6xl mx-auto pt-24 pb-12 px-6">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Friends</h1>
            <p className="text-gray-500 mt-1">You have {friends.length} connections</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#14919B] outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredFriends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFriends.map((friend) => (
              <div 
                key={friend.id} 
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md group"
              >
                {/* Profile Pic */}
                <div className="h-16 w-16 rounded-2xl overflow-hidden relative shrink-0 border border-gray-50">
                  {friend.picture_url ? (
                    <Image src={friend.picture_url} alt={friend.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center text-[#14919B]">
                      <User size={28} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{friend.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{friend.email}</p>
                  
                  <div className="flex gap-3 mt-3">
                    <button 
                      className="text-xs font-bold text-[#14919B] flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      <MessageSquare size={14} /> Message
                    </button>
                    <button 
                      onClick={() => handleUnfriend(friend.id)}
                      className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <UserMinus size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500">No friends found matching "{searchTerm}"</p>
          </div>
        )}
      </main>
    </div>
  );
}