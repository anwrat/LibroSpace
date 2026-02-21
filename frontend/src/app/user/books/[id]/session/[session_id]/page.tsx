'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReadingSession } from "@/hooks/useReadingSession";
import ReadingEditor from "@/components/Editor/ReadingEditor";
import EndSessionModal from "@/components/User/Reading/EndSesssionModal";
import { getSessionDetails, endReadingSession } from "@/lib/user";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Loader2, 
  ArrowLeft, 
  BookOpen 
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReadingSessionPage() {
  const params = useParams();
  const router = useRouter();
  
  // Extract IDs from dynamic segments
  const bookId = Number(params.id);
  const sessionId = Number(params.session_id);

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize custom hook for timer and autosave
  // It takes the sessionId and initial notes from the database
  const { seconds, notes, setNotes, isPaused, setIsPaused } = useReadingSession(
    sessionId,
    sessionData?.notes || ""
  );

  useEffect(() => {
    async function initFetch() {
      try {
        // Fetch specific session details using the ID from the URL
        const res = await getSessionDetails(sessionId);
        
        if (res.data.data) {
          setSessionData(res.data.data);
          // Note: useReadingSession handles setting initial notes via an internal useEffect
        } else {
          toast.error("Session not found");
          router.push(`/user/books/${bookId}`);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Could not load session data");
        router.push(`/user/books/${bookId}`);
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) initFetch();
  }, [sessionId, bookId, router]);

  // Handle final submission (Ending the session)
  const handleFinishSession = async (endPage: number) => {
    setSubmitting(true);
    try {
      // API call to update status to inactive and save final notes/page
      await endReadingSession(sessionId, endPage, notes, bookId);
      
      toast.success("Reading session saved!");
      router.push(`/user/books/${bookId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save session");
    } finally {
      setSubmitting(false);
      setShowEndModal(false);
    }
  };

  // Helper to format 00:00:00
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s]
      .map(v => v.toString().padStart(2, '0'))
      .filter((v, i) => v !== '00' || i > 0)
      .join(':');
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB]">
      <Loader2 className="animate-spin text-[#14919B]" size={40} />
      <p className="mt-4 font-bold text-gray-600">Loading your notebook...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-main">
      {/* --- STICKY TIMER HEADER --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors hidden md:block"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex items-center gap-4">
            <div className={`bg-gray-900 text-white px-5 py-2.5 rounded-2xl font-mono text-xl font-bold flex items-center gap-3 transition-all ${isPaused ? 'opacity-50' : 'shadow-lg shadow-black/10'}`}>
              <Clock size={20} className={isPaused ? "" : "animate-pulse text-[#14919B]"} />
              {formatTime(seconds)}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
            </button>
            <button 
              className="bg-[#14919B] text-white px-5 sm:px-7 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#14919B]/20 hover:bg-[#0f7178] transition-all"
              onClick={() => {
                setIsPaused(true);
                setShowEndModal(true);
              }}
            >
              <CheckCircle size={20} />
              <span className="hidden sm:inline">Finish</span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-4xl mx-auto pt-32 pb-20 px-6">
        <header className="mb-10">
          <div className="flex items-center gap-2 text-[#14919B] font-bold text-sm uppercase tracking-widest mb-1">
            <BookOpen size={16} />
            Currently Reading
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">
            {sessionData?.book_title || "Reading Notes"}
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2 font-medium">
            Starting from Page {sessionData?.start_page || 0}
          </p>
        </header>

        {/* TipTap Editor */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <ReadingEditor 
            content={notes} 
            onChange={(html) => setNotes(html)} 
          />
        </div>
        
        {/* Aesthetic Writing Tip Card */}
        <div className="mt-8 p-6 bg-[#14919B]/5 rounded-[2.5rem] border border-[#14919B]/10 flex gap-5">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 text-xl">
              💡
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Writing Tip</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Don&apos;t just summarize. Write down how this chapter made you <strong>feel</strong> or any predictions you have for the next one!
            </p>
          </div>
        </div>
      </main>

      {/* --- FINISH SESSION MODAL --- */}
      {showEndModal && (
        <EndSessionModal 
          isOpen={showEndModal}
          onClose={() => setShowEndModal(false)}
          onConfirm={handleFinishSession}
          loading={submitting}
          startPage={sessionData?.start_page || 0}
        />
      )}
    </div>
  );
}