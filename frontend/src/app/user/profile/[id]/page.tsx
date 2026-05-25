'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UserNav from "@/components/Navbar/UserNav";
import { useAuthContext } from "@/context/AuthContext";
import { 
  getOtherUserProfile, 
  getOtherDetailsforFriend, 
  addFriend, 
  challengeFriend, 
  acceptFriendRequest, 
  deleteFriendRequest 
} from "@/lib/user";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { 
  User, 
  Sword, 
  UserPlus, 
  Check, 
  X, 
  Loader2, 
  Mail, 
  Calendar, 
  UserMinus, 
  Clock,
  BookOpen, 
  ChevronLeft,
  ChevronRight,
  Award 
} from "lucide-react";
import { io } from "socket.io-client";
import Link from "next/link";

interface Badge {
  name: string;
  description: string;
  icon_url: string;
  earned_at: string;
}

interface ShelfItem {
  id: number;
  book_id: number;
  title: string;
  author: string;
  cover_url?: string;
  shelf: string;
  progress: number;
}

interface QuoteItem {
  id: number;
  content: string;
  book_title: string;
  author: string;
  cover_url?: string;
}

export default function OthersProfile() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthContext();
  
  const [data, setData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Friend Extras Matrices (Badges, Shelves, Quotes)
  const [badges, setBadges] = useState<Badge[]>([]);
  const [shelves, setShelves] = useState<ShelfItem[]>([]);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  
  // Quotes Carousel Chunk Offset state
  const [quotePage, setQuotePage] = useState(0);

  // --- CHALLENGE MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [challengeType, setChallengeType] = useState<'time' | 'pages'>('time');
  const [goalValue, setGoalValue] = useState(300);
  const [durationDays, setDurationDays] = useState(7);

  const fetchProfileAndDetails = async () => {
    if (!id) return;
    const targetId = Number(id);

    try {
      await Promise.all([
        getOtherUserProfile(targetId)
          .then(res => setData(res.data.data))
          .catch(err => console.error("Failed to load core profile metrics:", err))
          .finally(() => setLoadingProfile(false)),

        getOtherDetailsforFriend(targetId)
          .then(res => {
            const extraData = res.data?.data || res.data || {};
            setBadges(extraData.badges || []);
            setShelves(extraData.shelves || []);
            setQuotes(extraData.savedQuotes || []);
          })
          .catch(err => console.error("Failed to load extended companion details:", err))
          .finally(() => setLoadingDetails(false))
      ]);
    } catch (globalErr) {
      console.error("Error executing profile query pipeline:", globalErr);
    }
  };

  useEffect(() => {
    if (id) fetchProfileAndDetails();
  }, [id]);

  useEffect(() => {
    const targetId = id;
    if (currentUser?.id !== undefined && targetId !== undefined) {
      if (Number(currentUser.id) === Number(targetId)) {
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
      await fetchProfileAndDetails();
    } catch (err) {
      console.error(`${type} failed`, err);
      toast.error(`Action updated with errors.`);
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
      
      const socket = io(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000", {
        withCredentials: true
      });
      socket.emit('send_challenge', { 
        receiverId: id, 
        challengerName: currentUser?.name 
      });

      toast.success(`Challenge sent!`);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Challenge failed", err);
      toast.error("Could not register active challenge parameters.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#14919B]" size={32} />
      </div>
    );
  }

  const joinedDate = data?.created_at 
    ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Recently";

  // Calculate segment matrices for quote chunks
  const quotesPerPage = 5;
  const maxQuotePages = Math.ceil(quotes.length / quotesPerPage);
  const currentQuotesChunk = quotes.slice(quotePage * quotesPerPage, (quotePage * quotesPerPage) + quotesPerPage);

  const nextQuoteChunk = () => {
    if (quotePage + 1 < maxQuotePages) setQuotePage(prev => prev + 1);
  };

  const prevQuoteChunk = () => {
    if (quotePage > 0) setQuotePage(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-main text-gray-900 relative">
      <Toaster position="top-center" reverseOrder={false}/>
      <UserNav />
      
      <main className="max-w-5xl mx-auto pt-28 pb-12 px-6 space-y-6">
        
        {/* --- PROFILE HEADER CARD --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xs border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#14919B]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Avatar Section with Level Badge */}
            <div className="relative shrink-0 h-36 w-36">
              <div className="h-full w-full rounded-[2.5rem] bg-gray-100 overflow-hidden border-4 border-white shadow-xl relative">
                {data?.picture_url ? (
                  <Image src={data.picture_url} fill className="object-cover" alt="Profile" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[#14919B]">
                    <User size={56} />
                  </div>
                )}
              </div>
              
              {/* --- THE LEVEL BADGE --- */}
              <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-xl shadow-lg border border-gray-100">
                <div className="bg-[#14919B] text-white px-3.5 py-1.5 rounded-lg font-black flex items-center gap-1 select-none">
                  <span className="text-[9px] uppercase opacity-80 tracking-tighter">Lv</span>
                  <span className="text-lg leading-none">{data?.level ?? 1}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{data?.name}</h1>
              <div className="mt-2.5 flex flex-wrap justify-center md:justify-start items-center gap-4 text-gray-500 text-xs font-medium">
                <div className="flex items-center gap-1.5"><Mail size={13} className="text-[#14919B]" />{data?.email}</div>
                <div className="flex items-center gap-1.5"><Calendar size={13} className="text-[#14919B]" />Joined {joinedDate}</div>
              </div>
              
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                {data?.are_friends ? (
                  <>
                    <button 
                      onClick={() => setIsModalOpen(true)} 
                      className="flex items-center gap-2 px-6 py-3.5 bg-[#14919B] text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[#0e6b73] transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                    >
                      <Sword size={14} /> Challenge
                    </button>
                    <button 
                      onClick={() => handleFriendAction('remove')} 
                      disabled={actionLoading} 
                      className="flex items-center gap-2 px-6 py-3.5 bg-white border border-red-100 text-red-500 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-red-50 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <UserMinus size={14} />} Unfriend
                    </button>
                  </>
                ) : data?.request_received ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleFriendAction('accept')} 
                      disabled={actionLoading} 
                      className="flex items-center gap-2 px-6 py-3.5 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-green-600 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={14}/> : <Check size={14} />} Accept
                    </button>
                    <button 
                      onClick={() => handleFriendAction('reject')} 
                      disabled={actionLoading} 
                      className="flex items-center gap-2 px-6 py-3.5 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                ) : data?.request_sent ? (
                  <button 
                    onClick={() => handleFriendAction('remove')} 
                    className="px-6 py-3.5 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-gray-200 transition-all cursor-pointer"
                  >
                    Cancel Request
                  </button>
                ) : (
                  <button 
                    onClick={() => handleFriendAction('add')} 
                    disabled={actionLoading} 
                    className="flex items-center gap-2 px-6 py-3.5 bg-white text-[#14919B] border-2 border-[#14919B] rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[#14919B] hover:text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={14}/> : <UserPlus size={14} />} Add Friend
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- HORIZONTAL SCROLLABLE SHELF TRACK SECTION --- */}
        <section className="bg-white rounded-[2rem] p-8 shadow-xs border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Shelf</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {loadingDetails ? "..." : `${shelves.length} Books`}
                </p>
              </div>
            </div>
          </div>

          {loadingDetails ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-40 shrink-0 space-y-2 anonymity-pulse">
                  <div className="aspect-3/4 bg-gray-100 rounded-xl" />
                  <div className="h-3 bg-gray-100 rounded-sm w-3/4" />
                </div>
              ))}
            </div>
          ) : shelves.length > 0 ? (
            <div 
              className="flex gap-4 overflow-x-auto pb-3 touch-pan-y"
              style={{ scrollSnapType: 'x proximity' }}
            >
              {shelves.map((item) => (
                <Link
                  href={`/user/books/${item.book_id}`}
                  key={item.id} 
                  className="w-[150px] shrink-0 group flex flex-col gap-2"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="aspect-3/4 w-full rounded-xl overflow-hidden relative bg-gray-50 border border-gray-100 shadow-xs group-hover:shadow-md transition-shadow duration-300">
                    {item.cover_url ? (
                      <Image src={item.cover_url} alt={item.title} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center p-3 text-center text-gray-300 bg-gray-50">
                        <span className="text-[9px] font-black uppercase tracking-wider line-clamp-2">{item.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="px-0.5 min-w-0">
                    <p className="text-xs font-bold text-gray-700 truncate group-hover:text-[#14919B] transition-colors" title={item.title}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200/60">
              <p className="text-gray-400 text-xs font-medium">This bookshelf is currently empty.</p>
            </div>
          )}
        </section>

        {/* --- PAGINATED CHUNK SAVED QUOTES SECTION --- */}
        <section className="bg-white rounded-[2rem] p-8 shadow-xs border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Saved Quotes</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {loadingDetails ? "..." : `Showing ${quotePage * quotesPerPage + 1}-${Math.min((quotePage + 1) * quotesPerPage, quotes.length)} of ${quotes.length}`}
                </p>
              </div>
            </div>

            {/* Pagination Segment Shifter Controls */}
            {maxQuotePages > 1 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={prevQuoteChunk} 
                  disabled={quotePage === 0}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={nextQuoteChunk} 
                  disabled={quotePage + 1 === maxQuotePages}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {loadingDetails ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : currentQuotesChunk.length > 0 ? (
            <div className="space-y-3 transition-all duration-300 animate-in fade-in-50">
              {currentQuotesChunk.map((quote) => (
                <div key={quote.id} className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-colors flex flex-col gap-1.5">
                  <p className="text-xs font-bold text-gray-700 italic leading-relaxed">
                    "{quote.content}"
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-[#14919B] font-bold">Ref: {quote.book_title}</span>
                    {quote.author && (
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        — {quote.author}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200/60">
              <p className="text-gray-400 text-xs font-medium">No saved quotes or annotations cataloged.</p>
            </div>
          )}
        </section>

        {/* --- HORIZONTAL SCROLLABLE BADGES TRACK SECTION --- */}
        <section className="bg-white rounded-[2rem] p-8 shadow-xs border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Earned Badges</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {loadingDetails ? "..." : `${badges.length} Badges`}
              </p>
            </div>
          </div>

          {loadingDetails ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[280px] shrink-0 h-24 bg-gray-50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : badges.length > 0 ? (
            <div 
              className="flex gap-4 overflow-x-auto pb-3 touch-pan-y"
              style={{ scrollSnapType: 'x proximity' }}
            >
              {badges.map((badge, idx) => (
                <div 
                  key={idx} 
                  className="w-[280px] shrink-0 flex items-center gap-4 p-4 bg-gray-50/70 rounded-2xl border border-gray-100"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="h-14 w-14 shrink-0 rounded-xl bg-white shadow-xs p-2 border border-gray-100 relative">
                    {badge.icon_url ? (
                      <Image src={badge.icon_url} alt={badge.name} fill className="object-contain p-1.5" unoptimized />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-rose-500">
                        <Award size={24} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-gray-900 truncate">{badge.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-snug">{badge.description}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
                      {new Date(badge.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200/60">
              <p className="text-gray-400 text-xs font-medium">No specialized achievement badges earned yet.</p>
            </div>
          )}
        </section>

      </main>

      {/* --- CHALLENGE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Set Challenge</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"><X size={22} /></button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Challenge Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setChallengeType('time')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${challengeType === 'time' ? 'border-[#14919B] bg-[#14919B]/5 text-[#14919B]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    <Clock size={22} />
                    <span className="text-xs font-black uppercase tracking-wider">Minutes</span>
                  </button>
                  <button 
                    onClick={() => setChallengeType('pages')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${challengeType === 'pages' ? 'border-[#14919B] bg-[#14919B]/5 text-[#14919B]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    <BookOpen size={22} />
                    <span className="text-xs font-black uppercase tracking-wider">Pages</span>
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
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-xl font-black focus:ring-2 focus:ring-[#14919B] transition-all outline-hidden text-gray-900"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-wider text-gray-400 pointer-events-none">
                    {challengeType === 'time' ? 'Min' : 'Pages'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Duration</label>
                <div className="relative">
                  <select 
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-[#14919B] text-gray-700 appearance-none outline-hidden cursor-pointer"
                  >
                    <option value={3}>3 Days</option>
                    <option value={7}>1 Week</option>
                    <option value={14}>2 Weeks</option>
                    <option value={30}>1 Month</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-400" />
                </div>
              </div>

              <button 
                onClick={submitChallenge}
                disabled={actionLoading}
                className="w-full py-4 bg-[#14919B] text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-[#0e6b73] transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Sword size={16} />}
                Send Challenge Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}