"use client";

import { useState, useEffect, useMemo } from "react";
import { getJoinedCommunities } from "@/lib/user";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Users, Trophy, Search, SlidersHorizontal } from "lucide-react";

type SortOption = "members-desc" | "members-asc" | "level-desc";

export default function JoinedCommunities() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("members-desc");
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

  // --- FILTER & SORT LOGIC ---
  const processedCommunities = useMemo(() => {
    // 1. Filter by community name
    let result = communities.filter((c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // 2. Sort by choice
    result.sort((a, b) => {
      if (sortBy === "level-desc") {
        return (b.level || 0) - (a.level || 0);
      }
      if (sortBy === "members-asc") {
        return (a.member_count || 0) - (b.member_count || 0);
      }
      // Default: "members-desc"
      return (b.member_count || 0) - (a.member_count || 0);
    });

    return result;
  }, [communities, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-56 bg-gray-50 border border-gray-100 rounded-[2.5rem] animate-pulse p-6 flex flex-col justify-between"
          >
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

  return (
    <>
      {/* Search and Filter Panel Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-center bg-gray-50/50 p-4 border border-gray-100 rounded-[2rem]">
        {/* Search Bar */}
        <div className="md:col-span-2 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search joined communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#14919B]/40 focus:ring-2 focus:ring-[#14919B]/5 transition-all shadow-xs"
          />
        </div>

        {/* Filter Selector */}
        <div className="relative">
          <SlidersHorizontal
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={16}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 appearance-none focus:outline-none focus:border-[#14919B]/40 transition-all shadow-xs cursor-pointer"
          >
            <option value="members-desc">Highest Members</option>
            <option value="members-asc">Lowest Members</option>
            <option value="level-desc">Highest Level</option>
          </select>
        </div>
      </div>

      {processedCommunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {processedCommunities.map((community) => (
            <div
              key={community.id}
              onClick={() => router.push(`/user/community/${community.id}`)}
              className="group bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl overflow-hidden relative border border-gray-100 bg-gray-50 flex items-center justify-center text-[#14919B] shrink-0">
                  {community.photo_url ? (
                    <Image
                      src={community.photo_url}
                      alt={community.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Users size={24} strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg text-gray-900 group-hover:text-[#14919B] transition-colors truncate tracking-tight">
                    {community.name}
                  </h3>
                  <div className="text-xs font-bold text-gray-400 flex flex-wrap items-center gap-1 mt-1">
                    <Users size={12} className="text-[#14919B]/70" />
                    <span className="text-gray-600 font-medium mr-1">
                      {community.member_count || 0} members
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
                      <Trophy size={11} />
                      Lvl {community.level || 0}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-5 line-clamp-2 leading-relaxed">
                {community.description ||
                  "No description provided for this community."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200/80 px-6">
          <div className="bg-white h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs text-[#14919B]/40">
            <Users size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {searchQuery
              ? "No matches found"
              : "Your membership dashboard is empty"}
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed mb-6">
            {searchQuery
              ? "We couldn't find any of your joined rooms matching that name."
              : "You haven't joined any communities yet. Take a look at the Explore feed to find your group!"}
          </p>
        </div>
      )}
    </>
  );
}
