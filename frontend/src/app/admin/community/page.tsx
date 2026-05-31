"use client";

import { useEffect, useState, useMemo } from "react";
import AdminNav from "@/components/Navbar/AdminNav";
import { getAllCommunities } from "@/lib/admin";
import {
  Users,
  Search,
  Loader2,
  Filter,
  X,
  Calendar,
  Layers,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type SortRule = "members-desc" | "members-asc" | "date-desc" | "date-asc";

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- FILTER & MODAL STATE ---
  const [sortBy, setSortBy] = useState<SortRule>("date-desc");
  const [selectedCommunity, setSelectedCommunity] = useState<any | null>(null);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await getAllCommunities();
        setCommunities(res.data.data || []);
      } catch (err) {
        console.error("Failed to load communities", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  // --- FILTERING AND SORTING LOGIC ---
  const filteredAndSortedCommunities = useMemo(() => {
    // 1. Text Search Filtering
    const result = communities.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // 2. Multi-rule Sorting Evaluation
    result.sort((a, b) => {
      const countA = a.member_count || 0;
      const countB = b.member_count || 0;
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();

      switch (sortBy) {
        case "members-desc":
          return countB - countA;
        case "members-asc":
          return countA - countB;
        case "date-asc":
          return timeA - timeB;
        case "date-desc":
        default:
          return timeB - timeA;
      }
    });

    return result;
  }, [communities, searchQuery, sortBy]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <AdminNav />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 transition-all duration-300 p-8">
        {/* --- TOP BAR / HEADER --- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight font-main">
              Communities
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Review, moderate, and manage all LibroSpace groups.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Search Input Box */}
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#14919B] transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-[#14919B]/10 focus:border-[#14919B] outline-none w-72 md:w-80 shadow-sm transition-all font-medium"
              />
            </div>

            {/* Sorting Dropdown Tool */}
            <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-4 focus-within:ring-[#14919B]/10 focus-within:border-[#14919B] transition-all">
              <Filter
                size={18}
                className="text-gray-400 mr-2 pointer-events-none"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortRule)}
                className="bg-transparent text-sm font-bold text-gray-600 outline-none pr-4 cursor-pointer appearance-none"
              >
                <option value="date-desc">Newest Groups</option>
                <option value="date-asc">Oldest Groups</option>
                <option value="members-desc">Most Members</option>
                <option value="members-asc">Least Members</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 className="animate-spin text-[#14919B]" size={48} />
                <div className="absolute inset-0 m-auto w-2 h-2 bg-[#14919B] rounded-full"></div>
              </div>
              <p className="text-gray-400 font-bold text-lg animate-pulse tracking-tight">
                Syncing Communities...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Community Info
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Analytics
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAndSortedCommunities.map((community) => (
                    <tr
                      key={community.id}
                      onClick={() => setSelectedCommunity(community)}
                      className="hover:bg-gray-50/40 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-gray-100 overflow-hidden relative shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                            <Image
                              src={
                                community.image_url ||
                                "/Placeholders/community-placeholder.png"
                              }
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-[#14919B] transition-colors">
                              {community.name}
                            </p>
                            <p className="text-xs text-gray-400 font-medium line-clamp-1 max-w-60">
                              {community.description ||
                                "No description provided."}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                            <Users size={14} className="text-[#14919B]" />
                            {community.member_count || 0}
                          </div>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                            Total Members
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-500">
                        {new Date(community.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAndSortedCommunities.length === 0 && (
                <div className="p-32 text-center flex flex-col items-center">
                  <div className="h-24 w-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                    <Search size={40} className="text-gray-200" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 italic">
                    No Groups Found
                  </h3>
                  <p className="text-gray-400 font-medium mt-2">
                    Try adjusting your search or sorting rules.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- COMMUNITY DETAILS MODAL OVERLAY --- */}
      {selectedCommunity && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-[2.5rem] border border-gray-100 max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Cover Element */}
            <div className="h-32 bg-linear-to-r from-[#14919B]/20 to-[#14919B]/5 relative p-6 flex items-end">
              <button
                onClick={() => setSelectedCommunity(null)}
                className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-700 hover:scale-105 transition-all shadow-xs"
              >
                <X size={16} />
              </button>

              {/* Overlapping Avatar Container */}
              <div className="absolute -bottom-10 left-6 h-20 w-20 rounded-[1.5rem] bg-white p-1 border-2 border-white shadow-md overflow-hidden">
                <div className="relative w-full h-full rounded-[1.2rem] overflow-hidden bg-gray-50">
                  <Image
                    src={
                      selectedCommunity.image_url ||
                      "/Placeholders/community-placeholder.png"
                    }
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Modal Body Info Fields */}
            <div className="pt-14 p-6 pb-8">
              <h2 className="text-2xl font-black text-gray-900 font-main tracking-tight">
                {selectedCommunity.name}
              </h2>

              <div className="flex items-center gap-4 mt-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
                  <Users size={14} className="text-[#14919B]" />
                  <span>{selectedCommunity.member_count || 0} Members</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
                  <Calendar size={14} className="text-[#14919B]" />
                  <span>
                    Created{" "}
                    {new Date(selectedCommunity.created_at).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>
                </div>
              </div>

              {/* Description Block */}
              <div className="mt-5">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Layers size={12} /> About Group
                </h4>
                <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-2xl max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedCommunity.description ||
                      "This community doesn't have a description profile configured yet."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
