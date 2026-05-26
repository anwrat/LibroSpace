'use client';

import { useState } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { Plus, Users, Globe, Trophy } from "lucide-react";
import Link from "next/link";
import JoinedCommunities from "@/components/User/Community/JoinedCommunities";
import ExploreCommunities from "@/components/User/Community/Communities";
import CommunityLeaderBoard from "@/components/User/Community/CommunityLeaderBoard";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'joined' | 'explore' | 'leaderboard'>('joined');

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-28 px-4 sm:px-8 pb-16 font-main">
      <UserNav />

      <main className="max-w-6xl mx-auto">
        {/* Header Branding Container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Communities</h1>
            <p className="text-gray-500 mt-1.5 font-medium">Connect with other readers and discuss ideas.</p>
          </div>
          
          <Link 
            href='/user/community/create' 
            className="flex items-center justify-center gap-2 bg-[#14919B] hover:bg-[#11767e] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] shrink-0 cursor-pointer text-sm uppercase tracking-wider font-main" 
          >
            <Plus size={18} />
            Create Community
          </Link>
        </div>

        {/* Tab Switcher Interface Navigation */}
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1.5 rounded-2xl w-fit mb-10 border border-gray-200/30">
          <button
            onClick={() => setActiveTab('joined')}
            className={`flex items-center gap-2 px-6 py-2.5 cursor-pointer rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === 'joined' 
                ? 'bg-white text-[#14919B] shadow-xs' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users size={16} />
            Your Communities
          </button>
          
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-6 py-2.5 cursor-pointer rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === 'explore' 
                ? 'bg-white text-[#14919B] shadow-xs' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Globe size={16} />
            Explore
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-6 py-2.5 cursor-pointer rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === 'leaderboard' 
                ? 'bg-white text-[#14919B] shadow-xs' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Trophy size={16} />
            Leaderboard
          </button>
        </div>

        {/* Dynamic Render Sandbox Layout Canvas Container */}
        <div className="min-h-[400px]">
          {activeTab === 'joined' ? (
            <JoinedCommunities />
          ) : activeTab === 'explore' ? (
            <ExploreCommunities />
          ) : (
            <CommunityLeaderBoard />
          )}
        </div>
      </main>
    </div>
  );
}