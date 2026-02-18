'use client';

import { useState } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { Plus, Users, Globe } from "lucide-react";
import Link from "next/link";
import JoinedCommunities from "@/components/User/Community/JoinedCommunities";
import ExploreCommunities from "@/components/User/Community/Communities";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'joined' | 'explore'>('joined');

  return (
    <div className="min-h-screen bg-white pt-24 px-4 sm:px-8 pb-12 font-main">
      <UserNav />

      <main className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
            <p className="text-gray-500 mt-1">Connect with readers and share your thoughts.</p>
          </div>
          
          <Link href = '/user/community/create' className="flex items-center justify-center gap-2 bg-[#14919B] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#0f7178] transition-all shadow-lg shadow-[#14919B]/20 shrink-0 cursor-pointer" >
            <Plus size={20} />
            Create Community
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-100 p-1.5 rounded-2xl w-fit mb-8">
          <button
            onClick={() => setActiveTab('joined')}
            className={`flex items-center gap-2 px-6 py-2.5 cursor-pointer rounded-xl text-sm font-bold transition-all ${
              activeTab === 'joined' 
              ? 'bg-white text-[#14919B] shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={18} />
            Your Communities
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-6 py-2.5 cursor-pointer rounded-xl text-sm font-bold transition-all ${
              activeTab === 'explore' 
              ? 'bg-white text-[#14919B] shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe size={18} />
            Explore
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'joined' ? (
            <JoinedCommunities/>
          ) : (
            <ExploreCommunities />
          )}
        </div>
      </main>
    </div>
  );
}