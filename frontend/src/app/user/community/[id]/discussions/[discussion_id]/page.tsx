'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getAllComments, 
  addComment, 
  getDiscussionDetailsbyId 
} from "@/lib/user";
import UserNav from "@/components/Navbar/UserNav";
import Image from "next/image";
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Loader2, 
  Calendar,
  Sparkles,
  Bookmark,
  AlertCircle
} from "lucide-react";

export default function DiscussionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const communityId = Number(params.id);
    const discussionId = Number(params.discussion_id);

    const [discussion, setDiscussion] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const discussionRes = await getDiscussionDetailsbyId(communityId, discussionId);
            setDiscussion(discussionRes.data.data);

            const commentRes = await getAllComments(communityId, discussionId);
            setComments(commentRes.data.data || []);
            
        } catch (err) {
            console.error("Error fetching discussion details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (discussionId && communityId) {
            fetchData();
        }
    }, [discussionId, communityId]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewComment(e.target.value);
        // Clear error as the user types
        if (validationError) {
            setValidationError(null);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const cleanComment = newComment.trim();
        if (!cleanComment) return;

        // Validation for comment length
        if (cleanComment.length < 10) {
            setValidationError("Comment must be at least 10 characters long.");
            return;
        }

        setSubmitting(true);
        setValidationError(null);
        
        try {
            await addComment(communityId, discussionId, cleanComment);
            setNewComment("");
            
            const commentRes = await getAllComments(communityId, discussionId);
            setComments(commentRes.data.data || []);
        } catch (err) {
            console.error("Failed to post comment:", err);
            setValidationError("An unexpected error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#14919B]" size={40} />
            </div>
        );
    }

    if (!discussion) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-main">
                <h2 className="text-2xl font-black text-gray-900">Discussion not found</h2>
                <button 
                    onClick={() => router.back()}
                    className="mt-4 text-[#14919B] font-bold hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-main">
            <UserNav />
            
            <main className="max-w-6xl mx-auto pt-28 pb-20 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Discussion & Replies */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Navigation Header */}
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-400 hover:text-[#14919B] font-bold text-sm transition-all group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Community
                        </button>
                    </div>

                    {/* Main Discussion Post Card */}
                    <article className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-xs">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative w-12 h-12 shrink-0 rounded-2xl overflow-hidden bg-[#14919B]/10 flex items-center justify-center font-black text-[#14919B] text-xl border border-gray-100">
                                {discussion.initiator_pfp ? (
                                    <Image src={discussion.initiator_pfp} alt={discussion.initiator} fill className="object-cover" />
                                ) : (
                                    discussion.initiator?.[0].toUpperCase() || "?"
                                )}
                            </div>
                            <div>
                                <p className="font-black text-gray-900 text-base leading-none">
                                    {discussion.initiator}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
                                    <Calendar size={12} />
                                    {new Date(discussion.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-snug tracking-tight">
                            {discussion.title}
                        </h1>
                        
                        <p className="text-gray-600 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                            {discussion.content}
                        </p>
                    </article>

                    {/* Comments Section Container */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 px-2">
                            <MessageSquare className="text-[#14919B]" size={20} />
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                Replies <span className="text-[#14919B] ml-1 bg-[#14919B]/10 px-2 py-0.5 text-sm rounded-lg">{comments.length}</span>
                            </h2>
                        </div>

                        {/* Comment Input Box */}
                        <form 
                            onSubmit={handlePostComment} 
                            className={`bg-white p-2 rounded-[2.2rem] border shadow-xs transition-all ${
                                validationError ? 'border-red-400 focus-within:border-red-400 bg-red-50/5' : 'border-gray-200/60 focus-within:border-[#14919B]'
                            }`}
                        >
                            <textarea 
                                placeholder="Share your insights, notes, or counter-arguments..."
                                className="w-full min-h-[100px] pt-5 px-6 pb-2 text-gray-600 text-sm border-none outline-none resize-none bg-transparent placeholder:text-gray-400/80"
                                value={newComment}
                                onChange={handleTextareaChange}
                            />
                            
                            <div className="flex items-center justify-between p-2 pl-6">
                                {/* Error UI Segment */}
                                <div className="flex-1 pr-4">
                                    {validationError && (
                                        <div className="flex items-center gap-2 text-red-500 text-xs font-bold animate-fade-in">
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span>{validationError}</span>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="bg-[#14919B] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#0f7178] disabled:opacity-40 transition-all active:scale-95 shrink-0"
                                >
                                    {submitting ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <><Send size={14} /> Reply</>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* List of Comments */}
                        <div className="space-y-4">
                            {comments.length > 0 ? (
                                comments.map((comment) => {
                                    const avatarUrl = comment.userpfp || comment.user_photo_url || comment.avatar;
                                    const authorName = comment.user || comment.username || "Anonymous";

                                    return (
                                        <div 
                                            key={comment.id} 
                                            className="flex gap-4 p-6 bg-white rounded-[2rem] border border-gray-100 shadow-2xs hover:border-gray-200/80 transition-colors"
                                        >
                                            <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-200/60 flex items-center justify-center font-bold text-gray-400 text-sm">
                                                {avatarUrl ? (
                                                    <Image 
                                                        src={avatarUrl} 
                                                        alt={authorName} 
                                                        fill 
                                                        className="object-cover"
                                                        unoptimized 
                                                    />
                                                ) : (
                                                    authorName[0]?.toUpperCase() || "?"
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="font-bold text-gray-900 text-sm truncate">
                                                        {authorName}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider shrink-0">
                                                        • {new Date(comment.created_at).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap breakdown-words">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center border-2 border-dashed border-gray-200/60 rounded-[2.5rem] bg-white/50">
                                    <p className="text-gray-400 text-sm font-medium italic">No replies yet. Start the conversation!</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Side: Metadata / Activity Sidebar */}
                <div className="space-y-6 lg:mt-12">
                    {/* Guild Rules/Information Card */}
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xs">
                        <h3 className="font-black text-gray-900 mb-3 text-base tracking-tight flex items-center gap-2">
                            <Sparkles size={16} className="text-[#14919B]" />
                            Discussion Guidelines
                        </h3>
                        <p className="text-gray-500 text-xs leading-relaxed mb-2">
                            Be respectful and insightful.
                        </p>
                        <p className="text-gray-500 text-xs leading-relaxed font-bold flex items-center gap-1.5 bg-amber-50/60 p-2 rounded-xl border border-amber-100/40">
                            <AlertCircle size={12} /> Comments must be at least 10 characters.
                        </p>
                    </div>

                    {/* Quick Analytics Mini Card */}
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xs flex flex-col gap-3.5">
                        <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2.5">
                            <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Bookmark size={12} /> Status
                            </span>
                            <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                                ACTIVE
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400 font-bold uppercase tracking-wider">Total Actions</span>
                            <span className="font-black text-gray-700">{comments.length + 1} Logged</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}