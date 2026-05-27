'use client';

import { useEffect, useState, useMemo } from "react";
import { getAllCommunities } from "@/lib/user";
import { Loader2, Trophy, Sparkles, Users } from "lucide-react";
import Image from "next/image";

export default function CommunityLeaderBoard() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const res = await getAllCommunities();
        const data = res?.data?.data || res?.data || [];
        setCommunities(data);
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Compute leaderboard ordering rules sequentially: Level DESC -> XP DESC -> Name ASC (Alpha Tiebreaker)
  const rankedCommunities = useMemo(() => {
    return [...communities].sort((a, b) => {
      // 1. Primary Sort: Level (Descending)
      if ((b.level || 1) !== (a.level || 1)) {
        return (b.level || 1) - (a.level || 1);
      }
      
      // 2. Secondary Sort: XP (Descending)
      if ((b.xp || 0) !== (a.xp || 0)) {
        return (b.xp || 0) - (a.xp || 0);
      }
      
      // 3. Tertiary Sort: Name (Ascending Alphabetical Tiebreaker)
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
  }, [communities]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-[#14919B]" size={36} />
    </div>
  );

  if (rankedCommunities.length === 0) return (
    <div className="text-center py-16 bg-white rounded-[2.5rem] border border-gray-100">
      <Trophy size={40} className="mx-auto text-gray-200 mb-3" />
      <p className="text-gray-400 font-bold italic text-sm">No communities found to rank.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Community Leaderboard</h2>
      </div>

      <div className="space-y-3">
        {rankedCommunities.map((group, index) => {
          const rank = index + 1;
          
          return (
            <div 
              key={group.id} 
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                rank === 1 ? "bg-amber-50/40 border-amber-100" :
                rank === 2 ? "bg-slate-50/60 border-slate-100" :
                rank === 3 ? "bg-orange-50/30 border-orange-100" :
                "bg-gray-50/30 border-gray-100"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Clean Numerical Rank Badge Indicator */}
                <div className="w-8 shrink-0 flex justify-center items-center font-black text-sm">
                  <span className={`
                    ${rank === 1 ? "text-amber-600 text-base" :
                      rank === 2 ? "text-slate-500 text-base" :
                      rank === 3 ? "text-amber-800 text-base" :
                      "text-gray-400"}
                  `}>
                    #{rank}
                  </span>
                </div>

                {/* Avatar Wrapper Column */}
                <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/60 shrink-0">
                  {group.photo_url ? (
                    <Image src={group.photo_url} alt={group.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <Users size={16} />
                    </div>
                  )}
                </div>

                {/* Info Text Stack Container */}
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-gray-900 truncate">{group.name}</h3>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                    {group.member_count || 0} Members
                  </p>
                </div>
              </div>

              {/* Progress Level metrics and Experience value display elements */}
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <span className="flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-wide border border-amber-100/60">
                  <Sparkles size={11} fill="currentColor" />
                  LVL {group.level || 1}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  {group.xp || 0} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}