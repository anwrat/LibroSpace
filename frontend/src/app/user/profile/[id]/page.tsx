'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UserNav from "@/components/Navbar/UserNav";
import { useAuthContext } from "@/context/AuthContext";
import { getOtherUserProfile, addFriend, challengeFriend, acceptFriendRequest, deleteFriendRequest } from "@/lib/user";
import Image from "next/image";
import {toast, Toaster} from "react-hot-toast";
import { User, Sword, UserPlus, Check, X, Loader2, Mail, Calendar, UserMinus, Clock, BookOpen } from "lucide-react";

export default function OthersProfile() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthContext();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // --- CHALLENGE MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [challengeType, setChallengeType] = useState<'time' | 'pages'>('time');
  const [goalValue, setGoalValue] = useState(300);
  const [durationDays, setDurationDays] = useState(7);

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
      if (currentUser.id === targetId) {
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
      await fetchProfile();
    } catch (err) {
      console.error(`${type} failed`, err);
    } finally {
      setActionLoading(false);
    }
  };

  const submitChallenge = async () => {
    setActionLoading(true);
    try {
      await challengeFriend(
        Number(id), 
        challengeType, 
        goalValue, 
        durationDays 
      );
      
      toast.success(`Challenge sent! It will last ${durationDays} days from the moment ${data?.name} accepts it.`);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Challenge failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#14919B]" /></div>;

  const joinedDate = data?.created_at 
    ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Recently";

  return (
    <div className="min-h-screen bg-gray-50 font-main text-gray-900">
      <Toaster position="top-center" reverseOrder={false}/>
      <UserNav />
      <main className="max-w-5xl mx-auto pt-28 pb-12 px-6">
        
        {/* --- PROFILE HEADER --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
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
              <h1 className="text-3xl font-black">{data?.name}</h1>
              <div className="mt-3 flex flex-col md:flex-row items-center gap-4 text-gray-500 text-sm font-medium">
                <div className="flex items-center gap-2"><Mail size={16} className="text-[#14919B]" />{data?.email}</div>
                <div className="flex items-center gap-2"><Calendar size={16} className="text-[#14919B]" />Joined {joinedDate}</div>
              </div>
              
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                {data?.are_friends ? (
                  <>
                    <button 
                      onClick={() => setIsModalOpen(true)} 
                      className="flex items-center gap-2 px-6 py-3 bg-[#14919B] text-white rounded-2xl font-bold hover:bg-[#0e6b73] transition-all shadow-lg shadow-[#14919B]/20"
                    >
                      <Sword size={18} /> Challenge
                    </button>
                    <button onClick={() => handleFriendAction('remove')} disabled={actionLoading} className="flex items-center gap-2 px-6 py-3 bg-white border border-red-100 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all">
                      {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <UserMinus size={18} />} Unfriend
                    </button>
                  </>
                ) : data?.request_received ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleFriendAction('accept')} disabled={actionLoading} className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 shadow-lg shadow-green-500/20">
                      {actionLoading ? <Loader2 className="animate-spin" size={18}/> : <Check size={18} />} Accept
                    </button>
                    <button onClick={() => handleFriendAction('reject')} disabled={actionLoading} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100"><X size={18} /> Reject</button>
                  </div>
                ) : data?.request_sent ? (
                  <button onClick={() => handleFriendAction('remove')} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all">Cancel Request</button>
                ) : (
                  <button onClick={() => handleFriendAction('add')} disabled={actionLoading} className="flex items-center gap-2 px-6 py-3 bg-white text-[#14919B] border-2 border-[#14919B] rounded-2xl font-bold hover:bg-[#14919B] hover:text-white transition-all shadow-sm">
                    {actionLoading ? <Loader2 className="animate-spin" size={18}/> : <UserPlus size={18} />} Add Friend
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- CHALLENGE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Set Challenge</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Challenge Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setChallengeType('time')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${challengeType === 'time' ? 'border-[#14919B] bg-[#14919B]/5 text-[#14919B]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    <Clock size={24} />
                    <span className="text-sm font-bold">Minutes</span>
                  </button>
                  <button 
                    onClick={() => setChallengeType('pages')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${challengeType === 'pages' ? 'border-[#14919B] bg-[#14919B]/5 text-[#14919B]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    <BookOpen size={24} />
                    <span className="text-sm font-bold">Pages</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Target Goal</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={goalValue}
                    onChange={(e) => setGoalValue(Number(e.target.value))}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-xl font-black focus:ring-2 focus:ring-[#14919B] transition-all"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                    {challengeType === 'time' ? 'time' : 'pages'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Duration</label>
                <select 
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#14919B] appearance-none"
                >
                  <option value={3}>3 Days</option>
                  <option value={7}>1 Week</option>
                  <option value={14}>2 Weeks</option>
                  <option value={30}>1 Month</option>
                </select>
              </div>

              <button 
                onClick={submitChallenge}
                disabled={actionLoading}
                className="w-full py-4 bg-[#14919B] text-white rounded-2xl font-bold text-lg hover:bg-[#0e6b73] transition-all shadow-lg shadow-[#14919B]/20 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="animate-spin" /> : <Sword size={20} />}
                Send Challenge Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}