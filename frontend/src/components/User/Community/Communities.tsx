"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllCommunities } from "@/lib/user";
import Image from "next/image";
import {
  Users,
  ArrowUpRight,
  Loader2,
  Trophy,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";

type SortOption = "members-desc" | "members-asc" | "level-desc";

export default function ExploreCommunities() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("members-desc");
  const router = useRouter();

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await getAllCommunities();
        setCommunities(res.data || []);
      } catch (err) {
        console.error("Error loading communities: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunities();
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
      <div className="flex flex-col items-center justify-center py-24 w-full">
        <Loader2 className="animate-spin text-[#14919B] mb-4" size={40} />
        <p className="text-gray-500 font-medium animate-pulse">
          Curating available spaces...
        </p>
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
            placeholder="Search communities by name..."
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
              className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Image and Interactive Accent Element */}
                <div className="flex items-start justify-between mb-5">
                  <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center text-[#14919B] shrink-0">
                    {community.photo_url ? (
                      <Image
                        src={community.photo_url}
                        alt={community.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Users size={32} strokeWidth={1.5} />
                    )}
                  </div>

                  <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-[#14919B] group-hover:text-white transition-all duration-300 transform group-hover:rotate-12">
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                {/* Information Header Block */}
                <div className="mb-4">
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-[#14919B] transition-colors truncate tracking-tight">
                    {community.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-[#14919B] bg-[#14919B]/5 px-2.5 py-1 rounded-lg">
                      <Users size={12} />
                      {community.member_count || 0} members
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                      <Trophy size={12} />
                      Level {community.level || 0}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mt-2">
                {community.description ||
                  "Welcome to a collaborative room built around reading logs and chapter discourse."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200/80 px-6">
          <div className="bg-white h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs text-gray-300">
            <Users size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            No communities discovered
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {searchQuery
              ? "We couldn't find any rooms matching your search name. Try another query!"
              : "Be the pioneer explorer! Launch a brand new public forum room to connect with peers."}
          </p>
        </div>
      )}
    </>
  );
}
