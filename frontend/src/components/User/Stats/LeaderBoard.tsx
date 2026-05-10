'use client';

import { useEffect, useState } from "react";
import { getTodaysUserLeaderBoardbyXp } from '@/lib/user';
import { Loader2, Crown, Trophy, Medal, Flame } from "lucide-react";
import Image from "next/image";

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await getTodaysUserLeaderBoardbyXp();
                setLeaderboard(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#14919B]" size={32} />
        </div>
    );

    if (leaderboard.length === 0) return (
        <div className="text-center py-20 text-gray-400 bg-white rounded-[2.5rem] border border-gray-100">
            <p className="italic">No activity logged yet today. Be the first to start reading!</p>
        </div>
    );

    const topThree = leaderboard.slice(0, 3);
    const theRest = leaderboard.slice(3);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- TOP 3 PODIUM --- */}
            <div className="grid grid-cols-3 gap-4 items-end max-w-2xl mx-auto pt-10 pb-6">
                {/* 2nd Place */}
                {topThree[1] && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-300 overflow-hidden bg-gray-100">
                                {topThree[1].photo_url ? <Image src={topThree[1].photo_url} alt="" fill className="object-cover" /> : <div className="h-full w-full flex items-center justify-center font-bold text-slate-400">{topThree[1].name[0]}</div>}
                            </div>
                            <div className="absolute -top-2 -right-1 bg-slate-300 text-white p-1 rounded-full"><Medal size={14} /></div>
                        </div>
                        <p className="text-sm font-bold text-gray-700 truncate w-full text-center">{topThree[1].name}</p>
                        <div className="h-24 w-full bg-slate-200 rounded-t-2xl flex flex-col items-center justify-center">
                           <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">2nd</span>
                           <span className="text-lg font-black text-slate-600">{topThree[1].total_points} XP</span>
                        </div>
                    </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-amber-400 overflow-hidden bg-gray-100 shadow-xl shadow-amber-400/20">
                                {topThree[0].photo_url ? <Image src={topThree[0].photo_url} alt="" fill className="object-cover" /> : <div className="h-full w-full flex items-center justify-center font-bold text-amber-500 text-2xl">{topThree[0].name[0]}</div>}
                            </div>
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white p-1.5 rounded-full shadow-lg"><Crown size={20} /></div>
                        </div>
                        <p className="text-lg font-black text-gray-900 truncate w-full text-center">{topThree[0].name}</p>
                        <div className="h-32 w-full bg-[#14919B] rounded-t-2xl flex flex-col items-center justify-center text-white shadow-lg">
                           <span className="text-xs font-black opacity-70 uppercase tracking-widest">Champion</span>
                           <span className="text-2xl font-black">{topThree[0].total_points} XP</span>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-amber-700/40 overflow-hidden bg-gray-100">
                                {topThree[2].photo_url ? <Image src={topThree[2].photo_url} alt="" fill className="object-cover" /> : <div className="h-full w-full flex items-center justify-center font-bold text-amber-800/40">{topThree[2].name[0]}</div>}
                            </div>
                            <div className="absolute -top-2 -right-1 bg-amber-700/60 text-white p-1 rounded-full"><Medal size={14} /></div>
                        </div>
                        <p className="text-sm font-bold text-gray-700 truncate w-full text-center">{topThree[2].name}</p>
                        <div className="h-20 w-full bg-amber-100 rounded-t-2xl flex flex-col items-center justify-center">
                           <span className="text-xs font-black text-amber-800/50 uppercase tracking-tighter">3rd</span>
                           <span className="text-lg font-black text-amber-800/70">{topThree[2].total_points} XP</span>
                        </div>
                    </div>
                )}
            </div>

            {/* --- LIST VIEW FOR THE REST --- */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
                {theRest.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {theRest.map((user, index) => (
                            <div key={user.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-gray-300 w-4">{index + 4}</span>
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[#14919B]">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{user.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-1">
                                            <Flame size={10} className="text-orange-500" /> Daily Contributor
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900">{user.total_points} XP</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{user.total_activities} activities</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-10 text-center text-gray-400 text-sm font-medium">
                        Only the Top 3 are currently leading. Join the list!
                    </div>
                )}
            </div>
        </div>
    );
}