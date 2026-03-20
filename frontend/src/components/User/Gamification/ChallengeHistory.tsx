'use client';

import { useEffect, useState } from "react";
import { XCircle, Trophy, ChevronLeft, ChevronRight, Swords } from "lucide-react";
import { getUserFriendChallenges } from "@/lib/user";

interface ChallengeHistoryItem {
  id: number;
  challenger_name: string;
  challenged_name: string;
  challenge_type: 'time' | 'pages';
  goal_value: number;
  status: 'completed' | 'rejected' | 'active' | 'pending'; 
  winner_id: number | null;
  winner_name: string | null;
  completed_at: string;
}

export default function ChallengeHistory() {
  const [history, setHistory] = useState<ChallengeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchHistory = async () => {
    try {
      const res = await getUserFriendChallenges();
      const allChallenges: ChallengeHistoryItem[] = res.data?.data || [];
      
      const filteredHistory = allChallenges.filter(
        (item) => item.status === 'completed' || item.status === 'rejected'
      );

      const sortedHistory = filteredHistory.sort((a, b) => 
        new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
      );

      setHistory(sortedHistory);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  if (loading) return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm animate-pulse">
      <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );

  if (history.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Trophy className="text-yellow-500 w-5 h-5" /> Challenge History
        </h2>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
          Total: {history.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {currentItems.map((item) => (
          <div 
            key={item.id} 
            className={`p-5 rounded-2xl border transition-all ${
              item.status === 'completed' 
                ? 'bg-white border-gray-100 hover:border-green-200 shadow-sm' 
                : 'bg-gray-50 border-gray-100 opacity-75'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left Side: Challenge Info & Versus */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] uppercase tracking-tighter font-black px-2 py-0.5 rounded-md ${
                    item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400">
                    {item.challenge_type === 'time' ? '⏳ Time' : '📖 Pages'} • {item.goal_value} {item.challenge_type === 'time' ? 'mins' : 'pages'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900 truncate max-w-[100px]">
                    {item.challenger_name}
                  </span>
                  <Swords size={14} className="text-gray-300 shrink-0" />
                  <span className="text-sm font-bold text-gray-900 truncate max-w-[100px]">
                    {item.challenged_name}
                  </span>
                </div>
              </div>

              {/* Right Side: Winner / Result */}
              <div className="flex items-center gap-3 sm:border-l sm:pl-6 border-gray-100 min-w-[140px]">
                {item.status === 'completed' ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-yellow-100 p-2 rounded-xl">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-gray-400 leading-none mb-1">Winner</p>
                      <p className="text-sm font-black text-gray-900">
                        {item.winner_name || "N/A"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <XCircle size={16} />
                    <span className="text-xs font-bold italic">Rejected</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
               <span className="text-[10px] text-gray-300 font-medium">
                  Finished on {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : 'N/A'}
               </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-gray-50">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-sm font-bold text-gray-500">
            Page <span className="text-gray-900">{currentPage}</span> of {totalPages}
          </span>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}