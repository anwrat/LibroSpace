'use client';

import { useEffect, useState } from "react";
import { getAllReadingSessions, getAchievementThisMonth } from "@/lib/user"; 
import { BookOpen, Clock, Calendar, ChevronRight, Loader2, BarChart3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import MonthHeatMap from "./MonthHeatMap";

export default function SessionHistory() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [achievedDates, setAchievedDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Parallel fetch for better performance
                const [sessionRes, historyRes] = await Promise.all([
                    getAllReadingSessions(),
                    getAchievementThisMonth() 
                ]);

                setSessions(sessionRes.data.data || []);
                setAchievedDates(historyRes.data.data || []);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#14919B]" size={32} />
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. HEATMAP AT THE TOP */}
            <MonthHeatMap achievedDates={achievedDates} />

            <div className="flex items-center gap-2 mb-6 px-2">
                <BarChart3 size={20} className="text-[#14919B]" />
                <h3 className="text-xl font-bold text-gray-900">Recent Sessions</h3>
            </div>

            {/* 2. SESSIONS LIST */}
            {sessions.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No reading sessions found. Time to open a book!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <Link 
                            href={`/user/stats/${session.id}`} 
                            key={session.id}
                            className="group flex items-center gap-4 sm:gap-6 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-[#14919B]/30 transition-all"
                        >
                            <div className="relative w-14 h-20 rounded-xl overflow-hidden shadow-sm shrink-0">
                                <Image 
                                    src={session.cover_url || '/Placeholders/book-placeholder.png'} 
                                    alt={session.book_title} 
                                    fill 
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 group-hover:text-[#14919B] transition-colors truncate">
                                    {session.book_title}
                                </h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <Calendar size={12} className="text-[#14919B]" />
                                        {new Date(session.end_time).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <Clock size={12} className="text-[#14919B]" />
                                        {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <BookOpen size={12} className="text-[#14919B]" />
                                        p. {session.start_page} - {session.end_page}
                                    </span>
                                </div>
                            </div>

                            <ChevronRight size={20} className="text-gray-300 group-hover:text-[#14919B] group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}