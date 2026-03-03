'use client';

import { useState } from "react";
import UserNav from "@/components/Navbar/UserNav";
import SessionHistory from "@/components/User/Stats/SessionHistory";
import { History, BarChart3, PieChart } from "lucide-react";

type TabType = 'history' | 'insights' | 'achievements';

export default function StatsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('history');

    const tabs = [
        { id: 'history', label: 'History', icon: History },
        { id: 'insights', label: 'Insights', icon: BarChart3 },
        { id: 'achievements', label: 'Milestones', icon: PieChart },
    ];

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 font-main max-w-7xl mx-auto">
            <UserNav />
            
            <div className="max-w-4xl mx-auto">
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
                            Graph visualizations coming soon...
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="py-20 text-center text-gray-400 italic bg-white rounded-[2.5rem] border border-gray-100">
                            Badges and milestones coming soon...
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}