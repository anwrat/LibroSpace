'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCommunitybyId, checkCommunityMembership } from "@/lib/user";
import UserNav from "@/components/Navbar/UserNav";
import Image from "next/image";
import { Users, Calendar, ShieldCheck, MessageSquarePlus, MessageSquare } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function CommunityDetailsPage() {
  const params = useParams();
  const communityId = params.id;
  
  const [community, setCommunity] = useState<any>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await getCommunitybyId(Number(communityId));
        setCommunity(res.data);
        const membership = await checkCommunityMembership(Number(communityId));
        setIsMember(membership.data.isMember);
        setRole(membership.data.role);
      } catch (err) {
        console.error("Error fetching community:", err);
      } finally {
        setLoading(false);
      }
    }
    if (communityId) fetchDetails();
  }, [communityId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#14919B]" size={40} />
      </div>
    );
  }

  if (!community) return <div className="pt-32 text-center">Community not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-main">
      <UserNav />

      {/* Community Banner/Header */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl -mb-4 bg-gray-100">
            {community.photo_url ? (
              <Image src={community.photo_url} alt={community.name} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400"><Users size={40} /></div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-gray-900">{community.name}</h1>
            <p className="text-gray-500 mt-2 flex items-center justify-center md:justify-start gap-2 font-medium">
              <Users size={18} className="text-[#14919B]" />
              {community.member_count || 0} Members
            </p>
          </div>
          {!isMember && (
            <button className="bg-[#14919B] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#0f7178] transition-all shadow-lg shadow-[#14919B]/20">
              Join
            </button>
          )}
          {isMember && (
            <button className="bg-[#14919B] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#0f7178] transition-all shadow-lg shadow-[#14919B]/20">
              Leave
            </button>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Discussions */}
        <div className="lg:col-span-2 space-y-6">
          {isMember && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Discussions</h2>
            <button className="flex items-center gap-2 text-[#14919B] font-bold text-sm hover:underline">
              <MessageSquarePlus size={20} />
              New Post
            </button>
          </div>
          )}

          {/* Placeholder for Discussion Cards */}
          <div className="bg-white p-8 rounded-[2rem] border border-dashed border-gray-300 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="font-bold text-gray-900">No discussions yet</h3>
            <p className="text-gray-500 text-sm mt-1">Start the conversation in {community.name}!</p>
          </div>
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {community.description}
            </p>
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck size={18} className="text-[#14919B]" />
                <span className="text-gray-500">Mentor:</span>
                <span className="font-bold text-gray-900">{community.mentor_name || "Admin"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={18} className="text-[#14919B]" />
                <span className="text-gray-500">Created:</span>
                <span className="font-bold text-gray-900">
                  {new Date(community.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Rules/Community Guidelines Placeholder */}
          <div className="bg-[#14919B]/5 rounded-[2rem] p-6 border border-[#14919B]/10">
            <h3 className="font-bold text-[#14919B] mb-2">Community Rules</h3>
            <ul className="text-xs text-[#14919B]/80 space-y-2 list-disc ml-4">
              <li>Be respectful to all members</li>
              <li>No spoilers without warnings</li>
              <li>Keep discussions book-related</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}