'use client';

import { useEffect, useState, useRef, useMemo } from "react";
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
  removeMember,
  getActiveRoom, 
  startRoom,    
  getAllBooksforUser 
} from "@/lib/user";
import UserNav from "@/components/Navbar/UserNav";
import Image from "next/image";
import { 
  Users, ShieldCheck, MessageSquarePlus, 
  Loader2, Crown, Radio, Play, Sparkles,
  Search, BookOpen, Check, Trash2, X, MessageSquare, Clock
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

  // Book Search UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sidebar Members List Filter State Matrix
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("All");

  // Discussions Filter Tab State
  const [discSortType, setDiscSortType] = useState<"recent" | "popular">("recent");

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
      loading && setLoading(false);
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
      await startRoom(communityId, Number(selectedBookId));
      toast.success("Reading room started!");
      fetchRoomStatus();
      setSearchQuery("");
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

  // Click outside listener to dismiss the search results overlay dropdown view automatically
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        await changeMemberRole(communityId, memberId, newRole);
        toast.success("Role updated successfully");
        fetchMembersList();
    } catch (err) {
        toast.error("Failed to update role");
    } finally {
        setActionLoading(false);
    }
  };

  // Privileged handler method to completely expel a user record out from the database
  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (!confirm(`Are you absolutely sure you want to remove ${memberName} from this space?`)) return;
    try {
      setActionLoading(true);
      await removeMember(communityId, memberId);
      toast.success(`${memberName} has been removed.`);
      fetchMembersList();
    } catch (err) {
      toast.error("Failed to remove member");
    } finally {
      setActionLoading(false);
    }
  };

  // Compute Hierarchy Rank Weight Score Value Matrix Maps
  const getRoleWeight = (role: string): number => {
    switch (role?.toLowerCase()) {
      case 'mentor': return 3;
      case 'moderator': return 2;
      case 'member': return 1;
      default: return 0;
    }
  };

  // Process Sorting, Text Matching Queries, and Structural Sidebar Filtering Loops
  const filteredAndSortedMembers = useMemo(() => {
    return members
      .filter((member) => {
        const matchesSearch = member.name?.toLowerCase().includes(memberSearchQuery.toLowerCase().trim());
        const matchesRole = selectedRoleFilter === "All" || member.role?.toLowerCase() === selectedRoleFilter.toLowerCase();
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        const weightA = getRoleWeight(a.role);
        const weightB = getRoleWeight(b.role);
        
        // Arrange items descending based on weight score; if identical fallback alphabetically
        if (weightB !== weightA) return weightB - weightA;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [members, memberSearchQuery, selectedRoleFilter]);

  // Compute dynamic client-side sorting configuration for the discussions matrix loop arrays
  const sortedDiscussions = useMemo(() => {
    return [...discussions].sort((a, b) => {
      if (discSortType === "popular") {
        return (b.comment_count || 0) - (a.comment_count || 0);
      }
      // Fallback Default Matrix Ordering Rule: "recent" 
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [discussions, discSortType]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
      <Loader2 className="animate-spin text-[#14919B]" size={40} />
    </div>
  );

  const currentXp = community?.xp || 0;
  const nextLevelXp = community?.next_level_xp || 1000;
  const progressPercentage = Math.min(Math.max((currentXp / nextLevelXp) * 100, 0), 100);

  const filteredBooks = availableBooks.filter((book) =>
    book.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSelectedBook = availableBooks.find(b => String(b.id) === selectedBookId);

  return (
    <div className="min-h-screen bg-gray-50 font-main text-gray-900">
      <UserNav />

      {/* Header Container Dashboard Area */}
      <div className="bg-white border-b border-gray-200/80 pt-28 pb-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative h-32 w-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-gray-100 shrink-0">
            {community?.photo_url ? (
              <Image src={community.photo_url} alt={community.name} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400"><Users size={40} /></div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left min-w-0">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight truncate">{community?.name}</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#14919B] bg-[#14919B]/5 px-3 py-1.5 rounded-xl">
                <Users size={14} />
                {community?.member_count || 0} Members
              </span>

              <span className="flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                <Sparkles size={13} fill="currentColor" />
                Level {community?.level || 1}
              </span>
            </div>
          </div>

          <div className="shrink-0 mt-4 md:mt-0">
            {isMember && userRole === 'mentor' ? (
              <div className="flex items-center gap-2 bg-linear-to-r from-amber-500 to-orange-500 text-white px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-md shadow-amber-500/20">
                <Crown size={16} fill="white" />
                Community Owner
              </div>
            ) : isMember && userRole === 'moderator' ? (
              <div className="flex items-center gap-2 bg-linear-to-r from-[#14919B] to-[#1bc2cf] text-white px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-md shadow-[#14919B]/20">
                <ShieldCheck size={16} fill="white" />
                Staff Moderator
              </div>
            ) : (
              <button 
                onClick={handleMembershipToggle}
                disabled={actionLoading}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  isMember 
                    ? "bg-white text-gray-500 border border-gray-200/80 hover:bg-red-50 hover:text-red-600 hover:border-red-100" 
                    : "bg-[#14919B] text-white hover:bg-[#11767e] shadow-lg shadow-[#14919B]/20"
                }`}
              >
                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : isMember ? "Leave Group" : "Join Group"}
              </button>
            )}
          </div>
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
                    className="bg-white text-[#14919B] px-8 py-3 rounded-xl font-black hover:scale-105 transition-transform cursor-pointer"
                  >
                    Join Room
                  </button>
                ) : (userRole === 'mentor' || userRole === 'moderator') ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto relative" ref={searchContainerRef}>
                    
                    <div className="w-full sm:w-64 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={16} />
                      </div>
                      <input
                        type="text"
                        placeholder={currentSelectedBook ? currentSelectedBook.title : "Search book to start..."}
                        className="w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 pl-9 pr-4 p-3 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-[#14919B]/20 transition-all text-ellipsis overflow-hidden whitespace-nowrap"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                      />
                      
                      {isSearchFocused && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200/80 shadow-xl max-h-56 overflow-y-auto z-50 p-1.5 space-y-0.5">
                          {filteredBooks.length > 0 ? (
                            filteredBooks.map((book) => (
                              <button
                                key={book.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBookId(String(book.id));
                                  setSearchQuery(book.title);
                                  setIsSearchFocused(false);
                                }}
                                className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  selectedBookId === String(book.id)
                                    ? "bg-[#14919B]/10 text-[#14919B]"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <BookOpen size={14} className="shrink-0 text-gray-400" />
                                  <span className="truncate">{book.title}</span>
                                </div>
                                {selectedBookId === String(book.id) && <Check size={14} className="shrink-0 text-[#14919B]" />}
                              </button>
                            ))
                          ) : (
                            <div className="text-center text-gray-400 text-xs py-4 font-bold italic">
                              No matching books found
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handleStartRoom}
                      disabled={roomLoading}
                      className="w-full sm:w-auto bg-[#14919B] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0d6e75] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Discussions</h2>
                  
                  {/* Sorting Filter Selector Tabs */}
                  <div className="flex items-center gap-3 mt-2 bg-gray-200/60 p-1 rounded-xl w-fit border border-gray-200/20">
                    <button
                      type="button"
                      onClick={() => setDiscSortType("recent")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        discSortType === "recent"
                          ? "bg-white text-gray-900 shadow-xs"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Clock size={13} />
                      Most Recent
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscSortType("popular")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        discSortType === "popular"
                          ? "bg-white text-[#14919B] shadow-xs"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <MessageSquare size={13} />
                      Most Popular
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 text-[#14919B] font-bold text-sm hover:underline cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <MessageSquarePlus size={20} /> New Post
                </button>
              </div>

              {discLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#14919B]" /></div>
              ) : (
                <div className="space-y-4">
                  {sortedDiscussions.length > 0 ? sortedDiscussions.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => router.push(`/user/community/${communityId}/discussions/${post.id}`)}
                      className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[140px]"
                    >
                      <div>
                        <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-[#14919B] transition-colors">{post.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">{post.content}</p>
                      </div>

                      {/* Created At Metadata and Comment Count Structural Indicators Footer Block */}
                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : "Unknown Date"}
                        </span>
                        <span className="flex items-center gap-1 text-[#14919B] bg-[#14919B]/5 px-2 py-0.5 rounded-md">
                          <MessageSquare size={12} className="fill-current" />
                          {post.comment_count || 0} Comments
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-gray-400 py-10 font-medium">No discussions yet. Be the first to post!</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 text-center shadow-xs">
              <ShieldCheck size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-black text-gray-900">Member-only discussions</h3>
              <p className="text-gray-500 mt-2">Join this community to participate.</p>
            </div>
          )}
        </div>

        {/* Sidebar Cards Panel Wrapper */}
        <div className="space-y-6">
          
          {/* Progression Metrics Level Widget Block */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-base tracking-tight flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                Guild Experience
              </h3>
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                LVL {community?.level || 1}
              </span>
            </div>
            
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200/40 relative">
              <div 
                className="bg-linear-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-gray-400">
              <span>{currentXp} XP</span>
              <span>{nextLevelXp} XP FOR LEVEL UP</span>
            </div>
          </div>

          {/* About Card */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xs">
            <h3 className="font-black text-gray-900 mb-3 text-base tracking-tight">About Space</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{community?.description || "A room engineered for reading analytics and cooperative book summaries."}</p>
          </div>

          {/* ENHANCED MEMBERS LIST CARD PANEL */}
          {isMember && (
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
              <div>
                <h3 className="font-black text-gray-900 mb-1 text-base tracking-tight flex items-center gap-2">
                  <Users size={18} className="text-[#14919B]" /> Community Members
                </h3>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  Total Members • {members.length}
                </p>
              </div>

              {/* Search Bar Block Context View */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Find member by name..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 py-2 pl-9 pr-8 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#14919B]/30 focus:border-[#14919B] transition-all"
                />
                {memberSearchQuery && (
                  <button
                    onClick={() => setMemberSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-md hover:bg-gray-200/50 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Role Categorization Pill Switches */}
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                {["All", "Mentor", "Moderator", "Member"].map((roleTab) => (
                  <button
                    key={roleTab}
                    type="button"
                    onClick={() => setSelectedRoleFilter(roleTab)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      selectedRoleFilter === roleTab
                        ? "bg-white text-[#14919B] shadow-xs border border-gray-100"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {roleTab}
                  </button>
                ))}
              </div>

              {/* Core Dynamic Array Mapping Matrix Layout */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {filteredAndSortedMembers.length > 0 ? (
                  filteredAndSortedMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between gap-2 border-b border-gray-50/40 pb-2 last:border-none last:pb-0 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          member.role === 'mentor' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          member.role === 'moderator' ? 'bg-[#14919B]/10 text-[#14919B]' : 'bg-gray-50 text-gray-500'
                        }`}>
                          {member.name?.[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-gray-900 leading-none truncate">{member.name}</p>
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

                      {/* Interactive Configuration Action Toggles Stack */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Manage Role Select Component Array Mapping Rules */}
                        {userRole === 'mentor' && member.role !== 'mentor' && (
                          <select 
                            className="text-[10px] font-black bg-gray-50 border border-gray-200/60 rounded-lg focus:ring-0 focus:border-[#14919B]/40 cursor-pointer py-1 px-1.5 text-gray-600"
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            disabled={actionLoading}
                          >
                            <option value="member">Member</option>
                            <option value="moderator">Moderator</option>
                          </select>
                        )}

                        {/* Expel/Remove User Action Component Button */}
                        {userRole === 'mentor' && member.role !== 'mentor' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            disabled={actionLoading}
                            className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title={`Remove ${member.name} from group`}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs font-bold text-gray-400 italic">
                    No matching members found
                  </div>
                )}
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