'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getAllComments, 
  addComment, 
  getDiscussionDetailsbyId 
} from "@/lib/user";
import UserNav from "@/components/Navbar/UserNav";
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Loader2, 
  User, 
  Calendar 
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

    const fetchData = async () => {
        try {
            setLoading(true);
            const discussionRes = await getDiscussionDetailsbyId(communityId, discussionId);
            setDiscussion(discussionRes.data.data);

            const commentRes = await getAllComments(communityId, discussionId);
            console.log("Comments: ", commentRes.data.data);
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

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await addComment(communityId, discussionId, newComment);
            setNewComment("");
            
            // Re-fetch comments to show the new one
            const commentRes = await getAllComments(communityId, discussionId);
            setComments(commentRes.data.data || []);
        } catch (err) {
            console.error("Failed to post comment:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
                <Loader2 className="animate-spin text-[#14919B]" size={40} />
            </div>
        );
    }

    if (!discussion) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] font-main">
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
        <main className="min-h-screen bg-[#FDFCFB] pt-24 pb-20 px-6 font-main">
            <UserNav />
            
            <div className="max-w-3xl mx-auto">
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#14919B] font-bold transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Community
                    </button>
                </div>

                {/* Main Discussion Post */}
                <article className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-[#14919B]/10 flex items-center justify-center font-bold text-[#14919B] text-xl shadow-inner">
                            {discussion.initiator?.[0].toUpperCase() || "?"}
                        </div>
                        <div>
                            <p className="font-black text-gray-900 text-lg leading-none">
                                {discussion.initiator}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
                                <Calendar size={12} />
                                {new Date(discussion.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
                        {discussion.title}
                    </h1>
                    
                    <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                        {discussion.content}
                    </p>
                </article>

                {/* Comments Section Header */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-[#14919B] rounded-lg">
                            <MessageSquare className="text-white" size={20} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">
                            Conversation <span className="text-gray-300 ml-1">{comments.length}</span>
                        </h2>
                    </div>

                    {/* Comment Input Box */}
                    <form 
                        onSubmit={handlePostComment} 
                        className="bg-white p-2 rounded-[2.2rem] border border-gray-100 shadow-sm focus-within:border-[#14919B] transition-all"
                    >
                        <textarea 
                            placeholder="Add to the discussion..."
                            className="w-full min-h-[120px] p-6 text-gray-600 border-none outline-none resize-none bg-transparent"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex justify-end p-2">
                            <button 
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="bg-[#14919B] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#0f7178] disabled:opacity-50 shadow-lg shadow-[#14919B]/20 transition-all active:scale-95"
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <><Send size={18} /> Reply</>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* List of Comments */}
                    <div className="space-y-4">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div 
                                    key={comment.id} 
                                    className="flex gap-4 p-6 bg-white rounded-[2rem] border border-gray-50 hover:border-gray-100 transition-colors"
                                >
                                    <div className="w-10 h-10 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-300 border border-gray-100">
                                        {comment.username?.[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-gray-900 text-sm">
                                                {comment.username}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                                <p className="text-gray-400 font-medium italic">No replies yet. Start the conversation!</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}