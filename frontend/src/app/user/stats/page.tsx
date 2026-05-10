'use client';

import { useState } from "react";
import UserNav from "@/components/Navbar/UserNav";
import SessionHistory from "@/components/User/Stats/SessionHistory";
import UserBadges from "@/components/User/Stats/UserBadges";
import ReadingInsights from "@/components/User/Stats/Insights";
import Leaderboard from '@/components/User/Stats/LeaderBoard';
import { History, BarChart3, PieChart, Trophy } from "lucide-react";

type TabType = 'history' | 'insights' | 'achievements' | 'leaderboard';

export default function StatsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('history');

    const tabs = [
        { id: 'history', label: 'History', icon: History },
        { id: 'insights', label: 'Insights', icon: BarChart3 },
        { id: 'achievements', label: 'Achievements', icon: PieChart },
        { id: 'leaderboard', label: 'Daily Rank', icon: Trophy },
    ];

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 font-main mx-auto">
            <UserNav />
            
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your Reading Journey</h1>
                    <p className="text-gray-500 mt-2">Track every page, every minute, and every thought.</p>
                </header>

                {/* --- TAB SWITCHER --- */}
                <div className="flex p-1.5 bg-gray-100 rounded-[2rem] mb-8 w-fit">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] font-bold text-sm transition-all
                                    ${activeTab === tab.id 
                                        ? 'bg-white text-[#14919B] shadow-sm' 
                                        : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* --- CONTENT AREA --- */}
                <section>
                    {activeTab === 'history' && <SessionHistory />}
                    
                    {activeTab === 'insights' && (
                        <div className="py-20 text-center text-gray-400 italic bg-white rounded-[2.5rem] border border-gray-100">
                            <ReadingInsights />
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="mb-8 px-2">
                                <h2 className="text-2xl font-black text-gray-900">Achievement Showcase</h2>
                                <p className="text-gray-500 text-sm">Milestones you've conquered in your reading journey.</p>
                            </header>
                            <UserBadges />
                        </div>
                    )}
                    {activeTab === 'leaderboard' && <Leaderboard />}
                </section>
            </div>
        </main>
    );
}