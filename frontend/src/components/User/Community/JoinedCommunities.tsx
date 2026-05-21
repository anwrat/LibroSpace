'use client';

import { useState, useEffect } from "react";
import { getJoinedCommunities } from "@/lib/user";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Users, Trophy } from "lucide-react";

export default function JoinedCommunities() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchJoinedCommunities() {
      try {
        const res = await getJoinedCommunities();
        setCommunities(res.data || []);
      } catch (err) {
        console.error("Error loading joined communities: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJoinedCommunities();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 bg-gray-50 border border-gray-100 rounded-[2.5rem] animate-pulse p-6 flex flex-col justify-between">
            <div className="flex gap-4 items-center">
              <div className="h-16 w-16 bg-gray-200/60 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200/60 rounded-md w-3/4" />
                <div className="h-3 bg-gray-200/60 rounded-md w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200/60 rounded-md w-full" />
              <div className="h-3 bg-gray-200/60 rounded-md w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return communities.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {communities.map((community) => (
        <div 
          key={community.id}
          onClick={() => router.push(`/user/community/${community.id}`)}
          className="group bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden relative border border-gray-100 bg-gray-50 flex items-center justify-center text-[#14919B] shrink-0">
              {community.photo_url ? (
                <Image src={community.photo_url} alt={community.name} fill className="object-cover" />
              ) : (
                <Users size={24} strokeWidth={1.5} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-lg text-gray-900 group-hover:text-[#14919B] transition-colors truncate tracking-tight">
                {community.name}
              </h3>
              <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-1">
                <Users size={12} className="text-[#14919B]/70" /> 
                <span className="text-gray-600 font-medium">{community.member_count || 0} members</span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                  <Trophy size={12} />
                  Level {community.level || 0}
                </span>
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-5 line-clamp-2 leading-relaxed">
            {community.description || "No description provided for this community."}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200/80 px-6">
      <div className="bg-white h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs text-[#14919B]/40">
        <Users size={28} />
      </div>
      <h3 className="text-lg font-bold text-gray-900">Your membership dashboard is empty</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed mb-6">
        You haven&apos;t joined any communities yet. Take a look at the Explore feed to find your group!
      </p>
    </div>
  );
}