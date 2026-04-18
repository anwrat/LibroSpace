'use client';

import { useEffect, useState } from "react";
import AdminNav from "@/components/Navbar/AdminNav";
import { getAllQuoteRequests, updateQuoteRequestStatus } from "@/lib/admin";
import { Loader2, Check, X, Book, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminQuoteRequests() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [feedbackId, setFeedbackId] = useState<number | null>(null);
    const [feedbackText, setFeedbackText] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        try {
            const res = await getAllQuoteRequests();
            // Filtering for 'pending' so the admin only sees what needs action
            setRequests(res.data.data.filter((req: any) => req.status === "pending"));
        } catch (error) {
            toast.error("Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    }

    const handleAction = async (id: number, status: 'approved' | 'rejected') => {
        setProcessingId(id);
        try {
            await updateQuoteRequestStatus(id, status, feedbackText);
            toast.success(`Quote ${status} successfully!`);
            setRequests(prev => prev.filter(req => req.id !== id));
            setFeedbackId(null);
            setFeedbackText("");
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#14919B]" size={40} />
        </div>
    );

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 max-w-6xl mx-auto font-main">
            <AdminNav />
            <Toaster position="top-right" />

            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900">Quote Requests</h1>
                <p className="text-gray-500 font-medium">Review and approve community contributions.</p>
            </div>

            {requests.length > 0 ? (
                <div className="grid gap-6">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col lg:flex-row gap-8 justify-between">
                                
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <span className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                                            <Book size={14} /> {req.book_title}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-600 px-3 py-1 rounded-lg">
                                            <User size={14} /> @{req.requester_name}
                                        </span>
                                        {req.page_number && (
                                            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-lg">
                                                Page {req.page_number}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <p className="text-xl text-gray-800 italic leading-relaxed font-medium">
                                        "{req.text}"
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[180px]">
                                    <button
                                        disabled={processingId === req.id}
                                        onClick={() => handleAction(req.id, 'approved')}
                                        className="flex items-center justify-center gap-2 bg-green-50 text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        <Check size={18} /> Approve
                                    </button>
                                    
                                    <button
                                        onClick={() => setFeedbackId(feedbackId === req.id ? null : req.id)}
                                        className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-100 transition-all"
                                    >
                                        <X size={18} /> Reject
                                    </button>
                                </div>
                            </div>

                            {/* --- REJECTION FEEDBACK SECTION --- */}
                            {feedbackId === req.id && (
                                <div className="mt-6 pt-6 border-t border-dashed border-gray-200 animate-in slide-in-from-top-2 duration-200">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Rejection Feedback</label>
                                    <div className="flex gap-3">
                                        <textarea
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            placeholder="Why is this being rejected? (Optional)"
                                            className="flex-1 p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-red-200 outline-none text-sm resize-none"
                                        />
                                        <button
                                            onClick={() => handleAction(req.id, 'rejected')}
                                            disabled={processingId === req.id}
                                            className="bg-red-600 text-white px-6 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2"
                                        >
                                            {processingId === req.id ? <Loader2 className="animate-spin" size={18} /> : "Confirm Rejection"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <Check className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-400 font-bold text-xl">Inbox Zero! No pending requests.</p>
                </div>
            )}
        </main>
    );
}