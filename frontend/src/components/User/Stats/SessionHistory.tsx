'use client';

import { useEffect, useState, useMemo } from "react";
import { getAllReadingSessions, getAllAchievements } from "@/lib/user"; 
import { BookOpen, Clock, Calendar, ChevronRight, Loader2, BarChart3, ChevronLeft, Search, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import MonthHeatMap from "./MonthHeatMap";

type SortOption = "recent" | "duration" | "pages";

export default function SessionHistory() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [achievedDates, setAchievedDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // --- FILTER & SORT STATE ---
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("recent");

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const sessionsPerPage = 5;

    useEffect(() => {
        async function fetchData() {
            try {
                const [sessionRes, historyRes] = await Promise.all([
                    getAllReadingSessions(),
                    getAllAchievements() 
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

    // --- PROCESSING SESSIONS (SEARCH, SORT, PAGINATE) ---
    const filteredAndSortedSessions = useMemo(() => {
        // 1. Filter by book title search query
        let result = sessions.filter((session) => 
            session.book_title?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // 2. Apply chosen sorting mechanics
        result.sort((a, b) => {
            if (sortBy === "duration") {
                return (b.duration_seconds || 0) - (a.duration_seconds || 0);
            }
            if (sortBy === "pages") {
                const pagesA = (a.end_page || 0) - (a.start_page || 0) + 1;
                const pagesB = (b.end_page || 0) - (b.start_page || 0) + 1;
                return pagesB - pagesA;
            }
            // Default rule: "recent" (by timestamp)
            return new Date(b.end_time).getTime() - new Date(a.end_time).getTime();
        });

        return result;
    }, [sessions, searchQuery, sortBy]);

    // Calculate dynamic slice limits for pages
    const indexOfLastSession = currentPage * sessionsPerPage;
    const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
    const currentSessions = filteredAndSortedSessions.slice(indexOfFirstSession, indexOfLastSession);
    const totalPages = Math.ceil(filteredAndSortedSessions.length / sessionsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Helper to safely fall back to page 1 when data sets alter
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as SortOption);
        setCurrentPage(1);
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#14919B]" size={32} />
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. HEATMAP AT THE TOP */}
            <MonthHeatMap achievedDates={achievedDates} />

            {/* CONTROL PANEL LAYER: SEARCH & FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-center bg-gray-50/50 p-4 border border-gray-100 rounded-[2rem]">
                {/* Search Bar */}
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search books by title..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#14919B]/40 focus:ring-2 focus:ring-[#14919B]/5 transition-all shadow-xs"
                    />
                </div>

                {/* Filter Selector */}
                <div className="relative">
                    <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 appearance-none focus:outline-none focus:border-[#14919B]/40 transition-all shadow-xs cursor-pointer"
                    >
                        <option value="recent">Most Recent Date</option>
                        <option value="duration">Highest Reading Time</option>
                        <option value="pages">Highest Pages Read</option>
                    </select>
                </div>
            </div>

            {/* SECTION HEADER */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-[#14919B]" />
                    <h3 className="text-xl font-bold text-gray-900">
                        {searchQuery ? "Search Results" : "Recent Sessions"}
                    </h3>
                </div>
                {filteredAndSortedSessions.length > 0 && (
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </span>
                )}
            </div>

            {/* 2. SESSIONS LIST */}
            {filteredAndSortedSessions.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">
                        {searchQuery ? "No matching books found for your query." : "No reading sessions found. Time to open a book!"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {currentSessions.map((session) => {
                        const calculatedPages = (session.end_page - session.start_page) + 1;
                        return (
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
                                            p. {session.start_page} - {session.end_page} ({calculatedPages} {calculatedPages === 1 ? 'page' : 'pages'})
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#14919B] group-hover:translate-x-1 transition-all" />
                            </Link>
                        );
                    })}

                    {/* --- PAGINATION CONTROLS --- */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-6">
                            <button 
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => paginate(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                            currentPage === i + 1 
                                            ? 'bg-[#14919B] text-white shadow-lg shadow-[#14919B]/20' 
                                            : 'text-gray-400 hover:bg-gray-100'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}