'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UserNav from "@/components/Navbar/UserNav";
import { useAuthContext } from "@/context/AuthContext";
import { getOtherUserProfile, addFriend, challengeFriend, acceptFriendRequest, deleteFriendRequest } from "@/lib/user";
import Image from "next/image";
import { User, Sword, UserPlus, Check, X, Loader2, MessageCircle, Mail, Calendar, UserMinus } from "lucide-react";

export default function OthersProfile() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthContext();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await getOtherUserProfile(Number(id));
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  useEffect(() => {
    const targetId = id;
    if (currentUser?.id !== undefined && targetId !== undefined) {
      if (currentUser?.id === targetId) {
        router.push('/user/profile');
      }
    }
  }, [currentUser, id, router]);

  const handleFriendAction = async (type: 'add' | 'accept' | 'reject' | 'remove') => {
    const targetId = Number(id);
    if (type === 'remove' && !confirm("Are you sure you want to remove this friend?")) return;
    
    setActionLoading(true);
    try {
      if (type === 'add') await addFriend(targetId);
      if (type === 'accept') await acceptFriendRequest(targetId);
      if (type === 'reject' || type === 'remove') await deleteFriendRequest(targetId);
      
      await fetchProfile(); // Refresh status after action
    } catch (err) {
      console.error(`${type} failed`, err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChallenge = async () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    try {
      await challengeFriend(Number(id), 'most_minutes', 300, new Date().toISOString(), endDate.toISOString());
      alert("Challenge sent!");
    } catch (err) { 
      console.error("Challenge failed", err); 
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#14919B]" /></div>;

  const joinedDate = data?.created_at 
    ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Recently";

  return (
    <div className="min-h-screen bg-gray-50 font-main">
      <UserNav />
      <main className="max-w-5xl mx-auto pt-28 pb-12 px-6">
        
        {/* --- PROFILE HEADER --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Profile Avatar */}
            <div className="h-36 w-36 rounded-[2rem] bg-gray-100 overflow-hidden border-4 border-[#14919B]/10 relative shadow-inner">
              {data?.picture_url ? (
                <Image src={data.picture_url} fill className="object-cover" alt="Profile" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[#14919B]">
                  <User size={48} />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black text-gray-900">{data?.name}</h1>
              
              {/* Email & Joined Date */}
              <div className="mt-3 flex flex-col md:flex-row items-center gap-4 text-gray-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-[#14919B]" />
                  <span>{data?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#14919B]" />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                {/* 1. Friends: Challenge & Remove Friend */}
                {data?.are_friends ? (
                  <>
                    <button 
                      onClick={handleChallenge} 
                      className="flex items-center gap-2 px-6 py-3 bg-[#14919B] text-white rounded-2xl font-bold hover:bg-[#0e6b73] transition-all shadow-lg shadow-[#14919B]/20"
                    >
                      <Sword size={18} /> Challenge
                    </button>
                    <button 
                      onClick={() => handleFriendAction('remove')} 
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-red-100 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <UserMinus size={18} />}
                      Unfriend
                    </button>
                  </>
                ) : data?.request_received ? (
                  /* 2. Received: Accept/Reject */
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleFriendAction('accept')} 
                      disabled={actionLoading} 
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 shadow-lg shadow-green-500/20"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={18}/> : <Check size={18} />} Accept
                    </button>
                    <button 
                      onClick={() => handleFriendAction('reject')} 
                      disabled={actionLoading} 
                      className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-all"
                    >
                      <X size={18} /> Reject
                    </button>
                  </div>
                ) : data?.request_sent ? (
                  /* 3. Sent: Pending (Option to Cancel Request) */
                  <button 
                    onClick={() => handleFriendAction('remove')}
                    className="px-6 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel Request
                  </button>
                ) : (
                  /* 4. Stranger: Add Friend */
                  <button 
                    onClick={() => handleFriendAction('add')} 
                    disabled={actionLoading} 
                    className="flex items-center gap-2 px-6 py-3 bg-white text-[#14919B] border-2 border-[#14919B] rounded-2xl font-bold hover:bg-[#14919B] hover:text-white transition-all shadow-sm"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={18}/> : <UserPlus size={18} />} Add Friend
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}