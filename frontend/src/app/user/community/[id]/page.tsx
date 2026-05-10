'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getCommunitybyId, 
  checkCommunityMembership, 
  getAllDiscussions, 
  joinCommunity,
  leaveCommunity,
  getAllMembers, 
  checkUserRole,
  changeMemberRole,
  getActiveRoom, 
  startRoom,    
  getAllBooksforUser 
} from "@/lib/user";
import UserNav from "@/components/Navbar/UserNav";
import Image from "next/image";
import { 
  Users, Calendar, ShieldCheck, MessageSquarePlus, 
  MessageSquare, Loader2, UserCog, Crown, Radio, Play, BookOpen
} from "lucide-react";
import NewPostModal from "@/components/User/Community/NewPostModal";
import { toast } from "react-hot-toast";

export default function CommunityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = Number(params.id);

  // Core State
  const [community, setCommunity] = useState<any>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [discLoading, setDiscLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Reading Room State
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [roomLoading, setRoomLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getCommunitybyId(communityId);
      setCommunity(res.data);
      
      const membership = await checkCommunityMembership(communityId);
      setIsMember(membership.data.isMember);

      if (membership.data.isMember) {
        await Promise.all([
            fetchDiscussions(),
            fetchMembersList(),
            fetchCurrentUserRole(),
            fetchRoomStatus()
        ]);
      }
    } catch (err) {
      console.error("Error fetching community data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomStatus = async () => {
    try {
      const res = await getActiveRoom(communityId);
      if (res.data.data && res.data.data.length > 0) {
        setActiveRoom(res.data.data[0]); 
      } else {
        setActiveRoom(null); 
      }
    } catch (err) {
      console.error("Room fetch error:", err);
    }
  };

  const fetchCurrentUserRole = async () => {
    try {
        const res = await checkUserRole(communityId);
        const role = res.data.data;
        setUserRole(role);

        // If mentor/moderator, fetch books to populate start-room dropdown
        if (role === 'mentor' || role === 'moderator') {
          const booksRes = await getAllBooksforUser();
          setAvailableBooks(booksRes.data || []);
        }
    } catch (err) {
        console.error("Error fetching role:", err);
    }
  };

  const handleStartRoom = async () => {
    if (!selectedBookId) return toast.error("Please select a book first");
    
    setRoomLoading(true);
    try {
      await startRoom(communityId, Number(selectedBookId) );
      toast.success("Reading room started!");
      fetchRoomStatus(); // Refresh to show the active room UI
    } catch (err) {
      toast.error("Failed to start room");
    } finally {
      setRoomLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    setDiscLoading(true);
    try {
      const res = await getAllDiscussions(communityId);
      setDiscussions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching discussions:", err);
    } finally {
      setDiscLoading(false);
    }
  };

  const fetchMembersList = async () => {
    try {
        const res = await getAllMembers(communityId);
        setMembers(res.data.data || []);
    } catch (err) {
        console.error("Error fetching members:", err);
    }
  };

  useEffect(() => {
    if (communityId) fetchData();
  }, [communityId]);

  const handleMembershipToggle = async () => {
    setActionLoading(true);
    try {
      if (isMember) {
        await leaveCommunity(communityId);
        setIsMember(false);
        setDiscussions([]);
        setMembers([]);
        setUserRole(null);
        setActiveRoom(null);
      } else {
        await joinCommunity(communityId);
        setIsMember(true);
        fetchData();
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
        setActionLoading(true);
        await changeMemberRole(communityId, memberId, newRole );
        toast.success("Role updated successfully");
        fetchMembersList();
    } catch (err) {
        toast.error("Failed to update role");
    } finally {
        setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[#14919B]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-main">
      <UserNav />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-gray-100">
            {community?.photo_url ? (
              <Image src={community.photo_url} alt={community.name} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400"><Users size={40} /></div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-gray-900">{community?.name}</h1>
            <p className="text-gray-500 mt-2 flex items-center justify-center md:justify-start gap-2 font-medium">
              <Users size={18} className="text-[#14919B]" />
              {community?.member_count || 0} Members
            </p>
          </div>

          <button 
            onClick={handleMembershipToggle}
            disabled={actionLoading}
            className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${
              isMember 
                ? "bg-white text-gray-500 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100" 
                : "bg-[#14919B] text-white hover:bg-[#0f7178] shadow-lg shadow-[#14919B]/20"
            }`}
          >
            {actionLoading ? <Loader2 className="animate-spin" size={20} /> : isMember ? "Leave Group" : "Join Group"}
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* LIVE ROOM SECTION */}
          {isMember && (
            <div className={`p-8 rounded-[2.5rem] border transition-all ${
              activeRoom ? "bg-[#14919B] border-none text-white shadow-xl shadow-[#14919B]/30" : "bg-white border-2 border-dashed border-gray-200"
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${activeRoom ? "bg-white/20 animate-pulse" : "bg-gray-100"}`}>
                    <Radio size={28} className={activeRoom ? "text-white" : "text-gray-400"} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-black ${activeRoom ? "text-white" : "text-gray-900"}`}>
                      {activeRoom ? "Live Reading Session" : "No Active Room"}
                    </h2>
                    <p className={`text-sm ${activeRoom ? "text-white/80" : "text-gray-500"}`}>
                      {activeRoom ? `Reading: ${activeRoom.book_title}` : "Start a session to read together with others."}
                    </p>
                  </div>
                </div>

                {activeRoom ? (
                  <button 
                    onClick={() => router.push(`/user/community/${communityId}/live`)}
                    className="bg-white text-[#14919B] px-8 py-3 rounded-xl font-black hover:scale-105 transition-transform"
                  >
                    Join Room
                  </button>
                ) : (userRole === 'mentor' || userRole === 'moderator') ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <select 
                      className="w-full sm:w-48 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 p-3 outline-none focus:ring-2 focus:ring-[#14919B]/20"
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                    >
                      <option value="">Select Book...</option>
                      {availableBooks.map(book => (
                        <option key={book.id} value={book.id}>{book.title}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleStartRoom}
                      disabled={roomLoading}
                      className="w-full sm:w-auto bg-[#14919B] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0d6e75]"
                    >
                      {roomLoading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="white" />}
                      Start Room
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    No live rooms currently
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Discussions Section */}
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
              ) : (
                <div className="space-y-4">
                  {discussions.length > 0 ? discussions.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => router.push(`/user/community/${communityId}/discussions/${post.id}`)}
                      className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-[#14919B] transition-colors">{post.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{post.content}</p>
                    </div>
                  )) : (
                    <p className="text-center text-gray-400 py-10">No discussions yet. Be the first to post!</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 text-center shadow-sm">
              <ShieldCheck size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-black text-gray-900">Member-only discussions</h3>
              <p className="text-gray-500 mt-2">Join this community to participate.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* About Card */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{community?.description}</p>
          </div>

          {/* Members List Card */}
          {isMember && (
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <Users size={20} className="text-[#14919B]" /> Community Members
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#14919B]/10 flex items-center justify-center font-bold text-[#14919B] text-xs">
                        {member.name?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-none">{member.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {member.role === 'mentor' && <Crown size={10} className="text-amber-500" />}
                          {member.role === 'moderator' && <ShieldCheck size={10} className="text-[#14919B]" />}
                          <p className={`text-[9px] font-black uppercase tracking-widest ${
                            member.role === 'mentor' ? 'text-amber-500' : 
                            member.role === 'moderator' ? 'text-[#14919B]' : 'text-gray-400'
                          }`}>
                            {member.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    {userRole === 'mentor' && member.role !== 'mentor' && (
                      <select 
                        className="text-[10px] font-bold bg-gray-50 border-none rounded-lg focus:ring-0 cursor-pointer p-1"
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        disabled={actionLoading}
                      >
                        <option value="member">Member</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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