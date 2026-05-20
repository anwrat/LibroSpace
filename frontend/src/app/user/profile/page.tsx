'use client';

import { useEffect, useState, useRef } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { useAuthContext } from "@/context/AuthContext";
import { getAllFriends, changeProfilePic } from "@/lib/user";
import Image from "next/image";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Calendar, 
  Users, 
  ArrowRight, 
  Camera, 
  UploadCloud, 
  X, 
  Loader2, 
  Check 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Friend {
  id: number;
  name: string;
  picture_url?: string;
}

export default function UserProfile() {
  const { user, loading: authLoading } = useAuthContext();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  
  // Image Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Calculate XP Percentage
  const xpPercentage = user ? Math.min(Math.floor((user.xp / user.next_level_xp) * 100), 100) : 0;

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.id) return;
      try {
        const data = await getAllFriends();
        setFriends(data.data.friends || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchFriends();
  }, [user]);

  // Handle local file selection and create a temporary preview URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional validation: Ensure file is an image
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
      
      // Close modal and clear buffers
      handleCloseModal();
      
      // Force window reload or re-fetch session authentication context here if needed:
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
    <div className="min-h-screen bg-gray-50 font-main relative">
      <UserNav />
      <Toaster position="top-center" />

      <main className="max-w-5xl mx-auto pt-28 pb-12 px-6">
        
        {/* --- PROFILE HEADER --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#14919B]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
            
            {/* Avatar Section with Hover Overlay & Level Badge */}
            <div className="relative h-40 w-40 shrink-0">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="h-full w-full rounded-[2.5rem] bg-gray-100 overflow-hidden border-4 border-white shadow-xl relative group flex items-center justify-center cursor-pointer outline-hidden"
                title="Change profile picture"
              >
                {user?.picture_url ? (
                  <Image src={user.picture_url} alt="Profile" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[#14919B] transition-transform duration-500 group-hover:scale-105">
                    <User size={64} />
                  </div>
                )}

                {/* Blackout Hover Action Screen Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-1 p-2">
                  <Camera size={24} className="animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Update Avatar</span>
                </div>
              </button>

              {/* Hidden System Form Action Native Anchor */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />

              {/* Level Floating Badge */}
              <div className="absolute -bottom-3 -right-3 bg-[#14919B] text-white px-4 py-2 rounded-2xl shadow-lg border-4 border-white font-black text-xl flex items-center gap-1.5 pointer-events-none select-none">
                <span className="text-[10px] uppercase tracking-tighter opacity-80">Lv</span>
                {user?.level || 1}
              </div>
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user?.name}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                      <Mail size={14} className="text-[#14919B]" />
                      {user?.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                      <Calendar size={14} className="text-[#14919B]" />
                      Joined {joinedDate}
                    </div>
                  </div>
                </div>
                
                {/* XP Summary for Desktop */}
                <div className="hidden lg:block text-right">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Current Progress</p>
                  <p className="text-2xl font-black text-[#14919B]">
                    {user?.xp} <span className="text-gray-300">/</span> {user?.next_level_xp} <span className="text-sm text-gray-400 font-bold ml-1">XP</span>
                  </p>
                </div>
              </div>

              {/* --- XP BAR SECTION --- */}
              <div className="w-full">
                <div className="flex justify-between items-end mb-2">
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Level: {user?.level}</span>
                   </div>
                   <span className="text-xs font-bold text-gray-400 italic">{(user?.next_level_xp ?? 100) - (user?.xp || 0)} XP to next level</span>
                </div>
                
                {/* The Progress Bar */}
                <div className="h-5 w-full bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-100">
                  <div 
                    className="h-full bg-linear-to-r from-[#14919B] to-[#14c3d1] rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_15px_rgba(20,145,155,0.3)]"
                    style={{ width: `${xpPercentage}%` }}
                  >
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-white/20 w-full h-[50%] rounded-full" />
                  </div>
                </div>
                
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[11px] font-bold text-gray-400">Level {user?.level}</span>
                  <span className="text-[11px] font-bold text-gray-400">Level {(user?.level || 1) + 1}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FRIENDS PREVIEW SECTION --- */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#14919B]/10 rounded-xl text-[#14919B]">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Connections</h2>
                <p className="text-xs text-gray-400 font-medium">Build your network</p>
              </div>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-1 rounded-md ml-2 border border-gray-200">
                {friends.length}
              </span>
            </div>
            
            <Link 
              href="/user/friends" 
              className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#14919B] hover:text-white transition-all shadow-sm"
            >
              View Directory <ArrowRight size={14} />
            </Link>
          </div>

          {loadingFriends ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : friends.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {friends.slice(0, 6).map((friend) => (
                <Link href={`/user/profile/${friend.id}`} key={friend.id} className="flex flex-col items-center group">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden relative mb-3 border-2 border-transparent group-hover:border-[#14919B] transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1">
                    {friend.picture_url ? (
                      <Image src={friend.picture_url} alt={friend.name} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-700 truncate w-full text-center group-hover:text-[#14919B] transition-colors">
                    {friend.name.split(' ')[0]}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium">No connections yet.</p>
              <Link href="/user/explore" className="text-[#14919B] text-xs font-bold mt-2 inline-block bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                Discover Readers
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* --- CONFIRMATION MODAL INTERFACE OVERLAY --- */}
      {previewUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            
            {/* Close Trigger Button */}
            <button 
              onClick={handleCloseModal}
              disabled={isUploading}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>

            <div className="p-3 bg-[#14919B]/10 rounded-2xl text-[#14919B] mb-4 mt-2">
              <UploadCloud size={28} />
            </div>

            <h3 className="text-xl font-black text-gray-900 tracking-tight">Confirm Profile Picture</h3>
            <p className="text-xs text-gray-400 font-medium mt-1 mb-6">Preview your choice before applying changes.</p>

            {/* Profile Placement Canvas Preview Circle */}
            <div className="h-36 w-36 rounded-[2rem] bg-gray-50 overflow-hidden relative border-4 border-gray-100 shadow-inner mb-8">
              <Image 
                src={previewUrl} 
                alt="Upload preview" 
                fill 
                className="object-cover"
              />
            </div>

            {/* Modal Interactive Actions Footer Layout */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleCloseModal}
                disabled={isUploading}
                className="flex-1 py-3.5 px-4 bg-gray-100 text-gray-600 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-gray-200 transition-colors active:scale-98 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadConfirmation}
                disabled={isUploading}
                className="flex-1 py-3.5 px-4 bg-[#14919B] text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-[#117c85] transition-colors shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
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