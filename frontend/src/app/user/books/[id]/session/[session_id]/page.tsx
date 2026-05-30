'use client';

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReadingSession } from "@/hooks/useReadingSession";
import ReadingEditor from "@/components/Editor/ReadingEditor";
import EndSessionModal from "@/components/User/Reading/EndSesssionModal";
import { 
  getSessionDetails, 
  endReadingSession, 
  getBookbyID, 
  evaluateDailyGoal 
} from "@/lib/user";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Loader2, 
  ArrowLeft, 
  BookOpen,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReadingSessionPage() {
  const params = useParams();
  const router = useRouter();
  
  const bookId = Number(params.id);
  const sessionId = Number(params.session_id);

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSessionStuck, setIsSessionStuck] = useState(false);

  const { seconds, notes, setNotes, isPaused, setIsPaused } = useReadingSession(
    sessionId,
    sessionData?.notes || ""
  );

  useEffect(() => {
    async function initFetch() {
      try {
        const res = await getSessionDetails(sessionId);
        const bookData = await getBookbyID(bookId);
        
        if (res.data?.data) {
          const session = res.data.data;
          
          // CRITICAL CHECK: If backend returns that this session is already closed/inactive
          if (session.status === 'inactive' || session.is_closed) {
            setIsSessionStuck(true);
            setSessionData({...session, total_pages: bookData.data?.pagecount || 0});
            return;
          }

          setSessionData({...session, total_pages: bookData.data?.pagecount || 0});
        } else {
          toast.error("Session not found");
          router.push(`/user/books/${bookId}`);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        // If backend explicitly rejects because another session is active
        if (err.response?.status === 400 || err.response?.data?.isActive) {
          setIsSessionStuck(true);
        } else {
          toast.error("Could not load session data");
          router.push(`/user/books/${bookId}`);
        }
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) initFetch();
  }, [sessionId, bookId, router]);

  // --- SAFEGUARD 1: PREVENT CLOSING TAB / RELOADING ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSessionStuck) return; // Don't block them if the session is already invalid
      e.preventDefault();
      e.returnValue = "You have an active reading session. Are you sure you want to leave?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSessionStuck]);

  // --- SAFEGUARD 2: INTERCEPT APP BACK / NAVIGATION ONPAGE ---
  const handleSafeBackNavigation = useCallback(() => {
    if (isSessionStuck) {
      router.push(`/user/books/${bookId}`);
      return;
    }
    
    const confirmLeave = window.confirm(
      "Your reading timer is running! Backing out now will leave this session running in the background. Use the 'Finish' button to save cleanly. Leave anyway?"
    );
    if (confirmLeave) {
      router.push(`/user/books/${bookId}`);
    }
  }, [bookId, router, isSessionStuck]);

  // Handle final submission (Ending the session cleanly)
  const handleFinishSession = async (endPage: number) => {
    setSubmitting(true);
    try {
      await endReadingSession(sessionId, endPage, notes, bookId);
      await evaluateDailyGoal(); 
      toast.success("Reading session saved successfully!");
      
      // Navigate away safely bypassing checks
      setIsSessionStuck(true); 
      router.push(`/user/books/${bookId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save session");
    } finally {
      setSubmitting(false);
      setShowEndModal(false);
    }
  };

  // Safe manual abort mechanism for an active session clear-out
  const handleForceAbandonSession = async () => {
    const confirmAbort = window.confirm("Are you sure you want to discard this session? Progress and time recorded won't be saved.");
    if (!confirmAbort) return;

    setSubmitting(true);
    try {
      // Force end the session on current start page with existing notes to clear backend locks
      await endReadingSession(sessionId, sessionData?.start_page || 0, notes, bookId);
      toast.success("Session closed and cleared.");
      router.push(`/user/books/${bookId}`);
    } catch (err) {
      toast.error("Failed to cleanly exit session loop.");
    } finally {
      setSubmitting(false);
    }
  };

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

  // --- STUCK / GHOST SESSION ERROR RECOVERY UI ---
  if (isSessionStuck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] px-6 font-main">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl text-center flex flex-col items-center">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-500 mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Session Conflict</h3>
          <p className="text-gray-500 text-sm font-medium mt-2 mb-6 leading-relaxed">
            This session is either completed, or another reading track is currently locked active on your account profile.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => router.push(`/user/books/${bookId}`)}
              className="w-full py-3.5 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-gray-200 transition-colors"
            >
              Return to Book Hub
            </button>
            <button
              onClick={handleForceAbandonSession}
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
              <span>Force Reset Active Session</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-main">
      
      {/* --- STICKY TIMER HEADER --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleSafeBackNavigation}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
            title="Go back safely"
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
              title={isPaused ? "Resume Session" : "Pause Session"}
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

        {/* TipTap Rich Text Editor Interface Canvas */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <ReadingEditor 
            content={notes} 
            onChange={(html) => setNotes(html)} 
            editable={!isSessionStuck}
          />
        </div>
        
        {/* Aesthetic Context Writing Tip Card */}
        <div className="mt-8 p-6 bg-[#14919B]/5 rounded-[2.5rem] border border-[#14919B]/10 flex gap-5">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 text-xl select-none">
            💡
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Writing Tip</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Don&apos;t just summarize. Write down how this chapter made you <strong>feel</strong> or any projections you have for the next one!
            </p>
          </div>
        </div>
      </main>

      {/* --- FINISH SESSION MODAL LAYER --- */}
      {showEndModal && (
        <EndSessionModal 
          isOpen={showEndModal}
          onClose={() => setShowEndModal(false)}
          onConfirm={handleFinishSession}
          loading={submitting}
          startPage={sessionData?.start_page || 0}
          totalPage={sessionData?.total_pages || 0}
        />
      )}
    </div>
  );
}