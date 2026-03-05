'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getCommunitybyId, 
  checkCommunityMembership, 
  getAllDiscussions, 
} from "@/lib/user";
import UserNav from "@/components/Navbar/UserNav";
import Image from "next/image";
import { 
  Users, Calendar, ShieldCheck, MessageSquarePlus, 
  MessageSquare, Loader2 
} from "lucide-react";
import NewPostModal from "@/components/User/Community/NewPostModal";

export default function CommunityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = Number(params.id);

  const [community, setCommunity] = useState<any>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [discLoading, setDiscLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getCommunitybyId(communityId);
      setCommunity(res.data);
      
      const membership = await checkCommunityMembership(communityId);
      setIsMember(membership.data.isMember);

      if (membership.data.isMember) {
        fetchDiscussions();
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    setDiscLoading(true);
    try {
      const res = await getAllDiscussions(communityId);
      setDiscussions(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDiscLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) fetchData();
  }, [communityId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[#14919B]" size={40} />
    </div>
  );

  if (!community) return <div className="pt-32 text-center">Community not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-main">
      <UserNav />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-gray-100">
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
          <button className="bg-[#14919B] text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-all">
            {isMember ? "Leave Group" : "Join Group"}
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Discussions Area */}
        <div className="lg:col-span-2 space-y-6">
          {isMember ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Discussions</h2>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 text-[#14919B] font-bold text-sm hover:underline"
                >
                  <MessageSquarePlus size={20} /> New Post
                </button>
              </div>

              {discLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#14919B]" /></div>
              ) : discussions.length > 0 ? (
                <div className="space-y-4">
                  {discussions.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => router.push(`/user/communities/${communityId}/discussions/${post.id}`)}
                      className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center font-bold text-[#14919B]">
                          {post.initiator?.[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-none">{post.username}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-[#14919B] transition-colors">{post.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] border border-dashed text-center">
                  <MessageSquare size={40} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">No discussions yet. Be the first to post!</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-12 rounded-[2.5rem] border text-center">
              <ShieldCheck size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-black">Member-only discussions</h3>
              <p className="text-gray-500 mt-2">Join this group to see what everyone is talking about.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">About Community</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{community.description}</p>
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck size={18} className="text-[#14919B]" />
                <span className="text-gray-500">Mentor:</span>
                <span className="font-bold text-gray-900">{community.mentor_name || "Admin"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={18} className="text-[#14919B]" />
                <span className="text-gray-500">Created:</span>
                <span className="font-bold text-gray-900">{new Date(community.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <NewPostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        communityId={communityId} 
        onSuccess={fetchDiscussions} 
      />
    </div>
  );
}