'use client';

import { useEffect, useState, useRef } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { useAuthContext } from "@/context/AuthContext";
import { getAllFriends, changeProfilePic, getSavedQuotes, getUserShelves } from "@/lib/user";
import Image from "next/image";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Calendar,  
  ArrowRight, 
  Camera, 
  UploadCloud, 
  X, 
  Loader2, 
  Check,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Friend {
  id: number;
  name: string;
  picture_url?: string;
}

interface BookShelfItem {
  id: number;
  book_id: number;
  title: string;
  cover_url?: string;
}

interface SavedQuoteItem {
  id: number;
  content: string;
  author?: string;
}

export default function UserProfile() {
  const { user, loading: authLoading } = useAuthContext();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  
  // Custom Dynamic Shelves & Quotes State Matrix
  const [shelves, setShelves] = useState<BookShelfItem[]>([]);
  const [loadingShelves, setLoadingShelves] = useState(true);
  const [quotes, setQuotes] = useState<SavedQuoteItem[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  // Image Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Calculate XP Percentage
  const xpPercentage = user ? Math.min(Math.floor((user.xp / user.next_level_xp) * 100), 100) : 0;

  useEffect(() => {
    const fetchUserDataMetrics = async () => {
      if (!user?.id) return;
      
      try {
        Promise.all([
          getAllFriends()
            .then(res => setFriends(res.data.friends || []))
            .catch(err => console.error("Error fetching friends:", err))
            .finally(() => setLoadingFriends(false)),

          getUserShelves()
            .then(res => {
              const booksArr = res.data?.books || res.data || [];
              setShelves(booksArr);
            })
            .catch(err => console.error("Error fetching shelves:", err))
            .finally(() => setLoadingShelves(false)),

          getSavedQuotes()
            .then(res => {
              const quotesArr = res.data?.data || res.data || [];
              setQuotes(quotesArr);
            })
            .catch(err => console.error("Error fetching quotes:", err))
            .finally(() => setLoadingQuotes(false))
        ]);
      } catch (globalErr) {
        console.error("Error dispatching pipeline queries:", globalErr);
      }
    };

    fetchUserDataMetrics();
  }, [user]);

  // Handle local file selection and create a temporary preview URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Triggered when user confirms the upload action inside the modal
  const handleUploadConfirmation = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("profile", selectedFile); 

    setIsUploading(true);
    try {
      await changeProfilePic(formData);
      toast.success("Profile picture updated successfully!");
      handleCloseModal();
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Clean memory buffers and close upload window layers
  const handleCloseModal = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (authLoading) return <div className="min-h-screen bg-gray-50 animate-pulse" />;

  const joinedDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Recently";

  return (
    <div className="min-h-screen bg-gray-50 font-main relative text-gray-900">
      <UserNav />
      <Toaster position="top-center" />

      <main className="max-w-6xl mx-auto pt-28 pb-12 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CORE CHANNELS & ACTIVITY TIMELINE ACCENTS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* --- PROFILE HEADER CARD --- */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xs border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#14919B]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
              
              {/* Avatar Section with Hover Overlay & Level Badge */}
              <div className="relative h-36 w-36 shrink-0">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-full w-full rounded-[2.5rem] bg-gray-100 overflow-hidden border-4 border-white shadow-xl relative group flex items-center justify-center cursor-pointer outline-hidden"
                  title="Change profile picture"
                >
                  {user?.picture_url ? (
                    <Image src={user.picture_url} alt="Profile" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#14919B] transition-transform duration-500 group-hover:scale-105">
                      <User size={56} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-1 p-2">
                    <Camera size={20} className="animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Update Avatar</span>
                  </div>
                </button>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                <div className="absolute -bottom-2 -right-2 bg-[#14919B] text-white px-3.5 py-1.5 rounded-xl shadow-lg border-4 border-white font-black text-lg flex items-center gap-1 pointer-events-none select-none">
                  <span className="text-[9px] uppercase tracking-tighter opacity-80">Lv</span>
                  {user?.level || 1}
                </div>
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user?.name}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-1.5">
                      <div className="flex items-center gap-1.5 text-gray-500 font-medium text-xs">
                        <Mail size={13} className="text-[#14919B]" />
                        {user?.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 font-medium text-xs">
                        <Calendar size={13} className="text-[#14919B]" />
                        Joined {joinedDate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden md:block text-right">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.15em] mb-0.5">Current Progress</p>
                    <p className="text-xl font-black text-[#14919B]">
                      {user?.xp} <span className="text-gray-300">/</span> {user?.next_level_xp} <span className="text-xs text-gray-400 font-bold ml-0.5">XP</span>
                    </p>
                  </div>
                </div>

                {/* --- XP BAR SECTION --- */}
                <div className="w-full">
                  <div className="flex justify-between items-end mb-1.5">
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Level: {user?.level}</span>
                     </div>
                     <span className="text-[11px] font-bold text-gray-400 italic">{(user?.next_level_xp ?? 100) - (user?.xp || 0)} XP to next level</span>
                  </div>
                  
                  <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-100/40">
                    <div 
                      className="h-full bg-linear-to-r from-[#14919B] to-[#14c3d1] rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${xpPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-[50%] rounded-full" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-1 px-0.5">
                    <span className="text-[10px] font-bold text-gray-400">Level {user?.level}</span>
                    <span className="text-[10px] font-bold text-gray-400">Level {(user?.level || 1) + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- USER SHELVES GRID SECTION (MAX 5 BOOKS) --- */}
          <section className="bg-white rounded-[2rem] p-8 shadow-xs border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600">
                  <BookOpen size={20} />
                </div> */}
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Shelf</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {loadingShelves ? "..." : `${shelves.length} Books`}
                  </p>
                </div>
              </div>

              <Link 
                href="/user/profile/shelf" 
                className="bg-gray-50 border border-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#14919B] hover:text-white transition-all shadow-xs cursor-pointer"
              >
                See All <ArrowRight size={13} />
              </Link>
            </div>

            {loadingShelves ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="aspect-3/4 bg-gray-100 rounded-xl" />
                    <div className="h-3 bg-gray-100 rounded-sm w-3/4" />
                  </div>
                ))}
              </div>
            ) : shelves.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {shelves.slice(0, 5).map((book) => (
                  <Link href = {`/user/books/${book.book_id}`} key={book.id} className="group flex flex-col gap-2">
                    <div className="aspect-3/4 w-full rounded-xl overflow-hidden relative bg-gray-50 border border-gray-100 shadow-xs group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                      {book.cover_url ? (
                        <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center p-3 text-center text-gray-300 bg-gray-50">
                          {/* <BookOpen size={24} className="mb-1 text-gray-200" /> */}
                          <span className="text-[9px] font-black uppercase tracking-wider line-clamp-2">{book.title}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-700 truncate px-0.5 group-hover:text-[#14919B] transition-colors" title={book.title}>
                      {book.title}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200/60">
                <p className="text-gray-400 text-xs font-medium">Your book shelves are currently empty.</p>
              </div>
            )}
          </section>

          {/* --- SAVED QUOTES LOG TRACK SECTION (MAX 5 QUOTES) --- */}
          <section className="bg-white rounded-[2rem] p-8 shadow-xs border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Saved Quotes</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {loadingQuotes ? "..." : `${quotes.length} Quotes`}
                  </p>
                </div>
              </div>

              <Link 
                href="/user/profile/quotes" 
                className="bg-gray-50 border border-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#14919B] hover:text-white transition-all shadow-xs cursor-pointer"
              >
                See All <ArrowRight size={13} />
              </Link>
            </div>

            {loadingQuotes ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : quotes.length > 0 ? (
              <div className="space-y-3">
                {quotes.slice(0, 5).map((quote) => (
                  <div key={quote.id} className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-colors flex flex-col gap-1.5">
                    <p className="text-xs font-bold text-gray-700 italic leading-relaxed">
                      "{quote.content}"
                    </p>
                    {quote.author && (
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">
                        — {quote.author}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200/60">
                <p className="text-gray-400 text-xs font-medium">No citations or highlighted annotations saved yet.</p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: SIDEBAR VIEWPORT LAYERING FOR FRIENDS LIST */}
        <div className="space-y-6">
          <section className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div>
                  <h2 className="text-base font-black text-gray-900 tracking-tight">Friends</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {loadingFriends ? "..." : `${friends.length} Friends`}
                  </p>
                </div>
              </div>
              
              <Link 
                href="/user/friends" 
                className="bg-gray-50 text-gray-500 border border-gray-100 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 hover:bg-[#14919B] hover:text-white transition-all shadow-xs cursor-pointer"
              >
                SEE ALL <ArrowRight size={12} />
              </Link>
            </div>

            {loadingFriends ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : friends.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {friends.slice(0, 9).map((friend) => (
                  <Link href={`/user/profile/${friend.id}`} key={friend.id} className="flex flex-col items-center group min-w-0">
                    <div className="aspect-square w-full rounded-2xl overflow-hidden relative border-2 border-transparent group-hover:border-[#14919B] transition-all duration-300 shadow-xs group-hover:shadow-md group-hover:-translate-y-0.5 bg-gray-50">
                      {friend.picture_url ? (
                        <Image src={friend.picture_url} alt={friend.name} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <User size={18} />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-gray-600 truncate w-full text-center mt-1.5 group-hover:text-[#14919B] transition-colors">
                      {friend.name.split(' ')[0]}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200/60">
                <p className="text-gray-400 text-xs font-medium">No network connections.</p>
                <Link href="/user/explore" className="text-[#14919B] text-[10px] font-black uppercase tracking-wider mt-2.5 inline-block bg-white px-3 py-1.5 rounded-xl shadow-xs border border-gray-100 cursor-pointer">
                  Find Readers
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* --- CONFIRMATION MODAL INTERFACE OVERLAY --- */}
      {previewUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            
            <button 
              onClick={handleCloseModal}
              disabled={isUploading}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="p-3 bg-[#14919B]/10 rounded-2xl text-[#14919B] mb-4 mt-2">
              <UploadCloud size={28} />
            </div>

            <h3 className="text-xl font-black text-gray-900 tracking-tight">Confirm Profile Picture</h3>
            <p className="text-xs text-gray-400 font-medium mt-1 mb-6">Preview your choice before applying changes.</p>

            <div className="h-36 w-36 rounded-[2rem] bg-gray-50 overflow-hidden relative border-4 border-gray-100 shadow-inner mb-8">
              <Image 
                src={previewUrl} 
                alt="Upload preview" 
                fill 
                className="object-cover"
              />
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleCloseModal}
                disabled={isUploading}
                className="flex-1 py-3.5 px-4 bg-gray-100 text-gray-600 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-gray-200 transition-colors active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadConfirmation}
                disabled={isUploading}
                className="flex-1 py-3.5 px-4 bg-[#14919B] text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-[#117c85] transition-colors shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Confirm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}