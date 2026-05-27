'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessionDetails, updateSessionNotes, deleteReadingSession } from "@/lib/user"; 
import UserNav from "@/components/Navbar/UserNav";
import ReadingEditor from "@/components/Editor/ReadingEditor";
import { ArrowLeft, Clock, BookOpen, Calendar, Quote, Trash2, Edit3, Check, X, Loader2 } from "lucide-react";

export default function SessionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Feature States
    const [isEditing, setIsEditing] = useState(false);
    const [notesContent, setNotesContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function fetchDetails() {
            try {
                const res = await getSessionDetails(Number(params.session_id));
                setSession(res.data.data);
                setNotesContent(res.data.data.notes || "");
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        if (params.session_id) fetchDetails();
    }, [params.session_id]);

    const handleSaveNotes = async () => {
        setIsSaving(true);
        try {
            await updateSessionNotes(Number(params.session_id), notesContent);
            setSession((prev: any) => ({ ...prev, notes: notesContent }));
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update notes:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteReadingSession(Number(params.session_id));
            router.push("/user/stats"); 
        } catch (err) {
            console.error("Failed to delete session:", err);
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#14919B] mb-4" size={36} />
                <p className="text-gray-500 font-bold text-sm tracking-wide uppercase">Loading session...</p>
            </div>
        );
    }

    if (!session) return <div className="pt-32 text-center font-bold text-gray-500">Session not found.</div>;

    const durationMins = Math.floor(session.duration_seconds / 60);

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 font-main mx-auto max-w-7xl relative">
            <UserNav />
            
            <div className="max-w-7xl mx-auto">
                {/* Top Action Layer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#14919B] font-bold transition-colors w-fit"
                    >
                        <ArrowLeft size={20} />
                        Back to Stats
                    </button>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 text-red-400 hover:text-red-600 font-bold text-sm transition-colors uppercase tracking-wider w-fit"
                    >
                        <Trash2 size={16} />
                        Delete Session
                    </button>
                </div>

                {/* Header Section */}
                <header className="mb-10">
                    <div className="flex items-center gap-3 text-[#14919B] mb-2">
                        <Calendar size={18} />
                        <span className="font-bold uppercase tracking-widest text-sm">
                            {new Date(session.end_time).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 leading-tight">
                        Notes on <span className="text-[#14919B]">{session.book_title}</span>
                    </h1>
                </header>

                {/* Stats Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xs flex items-center gap-4">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl shrink-0">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</p>
                            <p className="text-xl font-black text-gray-900">{durationMins}m {session.duration_seconds % 60}s</p>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xs flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl shrink-0">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pages Read</p>
                            <p className="text-xl font-black text-gray-900">
                                {session.start_page} — {session.end_page} 
                                <span className="text-sm text-gray-400 font-medium ml-2">({session.end_page - session.start_page + 1} pages)</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Notes Section Container */}
                <section className="bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Quote className="text-[#14919B]" fill="#14919B" size={20} />
                            <h2 className="text-xl font-black text-gray-900">Session Notes</h2>
                        </div>
                        
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:text-[#14919B] hover:border-[#14919B]/20 transition-all"
                            >
                                <Edit3 size={14} />
                                Edit Notes
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNotesContent(session.notes || "");
                                    }}
                                    disabled={isSaving}
                                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <X size={14} /> Cancel
                                </button>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={isSaving}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#14919B] text-white rounded-lg text-xs font-bold hover:bg-[#0e6b72] transition-colors shadow-xs disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Check size={14} />
                                    )}
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="min-h-40">
                        {isEditing ? (
                            <ReadingEditor 
                                content={notesContent} 
                                onChange={setNotesContent}
                                editable={true} 
                            />
                        ) : session.notes ? (
                            <ReadingEditor 
                                content={session.notes} 
                                editable={false} 
                            />
                        ) : (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-100 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                                <p className="text-gray-400 font-medium italic text-sm">No notes were taken during this session.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Confirmation Overlay for Safe Destruction */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-gray-100 max-w-sm w-full p-6 rounded-[2rem] shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-gray-900">Delete this log?</h4>
                            <p className="text-xs text-gray-400 font-bold mt-1 leading-relaxed">
                                This action is permanent. All details of this session will be lost.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="w-full py-2.5 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                No, keep it
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full py-2.5 bg-red-500 text-white rounded-xl font-bold text-xs hover:bg-red-600 shadow-sm transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                                {isDeleting && <Loader2 size={12} className="animate-spin" />}
                                {isDeleting ? "Deleting..." : "Yes, delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}