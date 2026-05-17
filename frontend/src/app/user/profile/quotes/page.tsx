'use client';

import { useEffect, useState } from "react";
import { getSavedQuotes, toggleSaveQuote, getAllQuoteRequests } from "@/lib/user";
import UserNav from "@/components/Navbar/UserNav";
import { 
  Loader2, 
  HeartCrack, 
  Quote as QuoteIcon, 
  Trash2, 
  Inbox,
  Clock, 
  CheckCircle2, 
  XCircle,
  CornerDownRight,
  MessageSquareX
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type MainTab = 'saved' | 'requests';
type RequestStatusFilter = 'pending' | 'approved' | 'rejected';

export default function SavedQuotesPage() {
    const [activeTab, setActiveTab] = useState<MainTab>('saved');
    const [statusFilter, setStatusFilter] = useState<RequestStatusFilter>('pending');
    
    const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
    const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPageData() {
            try {
                const [savedRes, requestsRes] = await Promise.all([
                    getSavedQuotes(),
                    getAllQuoteRequests()
                ]);
                
                setSavedQuotes(savedRes.data.data || savedRes.data || []);
                setQuoteRequests(requestsRes.data.data || []);
            } catch (error) {
                console.error("Error loading page resources:", error);
                toast.error("Failed to sync your library records.");
            } finally {
                setLoading(false);
            }
        }
        fetchPageData();
    }, []);

    const handleRemoveQuote = async (quoteId: number) => {
        try {
            await toggleSaveQuote(quoteId);
            setSavedQuotes(prev => prev.filter(q => q.id !== quoteId));
            toast.success("Quote removed from library");
        } catch (error) {
            console.error("Error removing quote:", error);
            toast.error("Could not complete action.");
        }
    };

    // Filter requests based on internal state selection
    const filteredRequests = quoteRequests.filter(req => req.status === statusFilter);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-[#14919B]" size={40} />
                <p className="text-sm font-bold text-gray-400 animate-pulse">Syncing Library Vault...</p>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto font-main bg-[#F8FAFC]">
            <UserNav />
            <Toaster position="top-center" />

            {/* --- PAGE HEADER --- */}
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <QuoteIcon className="text-[#14919B]" size={28} />
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Quotes Hub</h1>
                </div>
                <p className="text-gray-500 font-medium">Manage your book markings and custom feed suggestions.</p>
            </header>

            {/* --- PRIMARY LAYER ROUTING TABS --- */}
            <div className="flex border-b border-gray-200 gap-6 mb-8">
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`pb-4 text-sm font-black uppercase tracking-wider border-b-2 transition-all ${
                        activeTab === 'saved'
                            ? 'border-[#14919B] text-[#14919B]'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Saved Collection ({savedQuotes.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`pb-4 text-sm font-black uppercase tracking-wider border-b-2 transition-all ${
                        activeTab === 'requests'
                            ? 'border-[#14919B] text-[#14919B]'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    My Submissions ({quoteRequests.length})
                </button>
            </div>

            {/* --- RENDER TAB: SAVED QUOTES --- */}
            {activeTab === 'saved' && (
                savedQuotes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {savedQuotes.map((quote) => (
                            <div 
                                key={quote.id} 
                                className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#14919B]/10 group-hover:bg-[#14919B] transition-colors" />

                                <div className="flex-1">
                                    <p className="text-gray-700 text-xl leading-relaxed italic mb-4 pr-4">
                                        "{quote.content}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-[#14919B] bg-[#14919B]/5 px-3 py-1.5 rounded-xl uppercase tracking-tight">
                                            {quote.book_title || "Unknown Book"}
                                        </span>
                                        {quote.author && (
                                            <span className="text-sm text-gray-400 font-medium">
                                                — {quote.author}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRemoveQuote(quote.id)}
                                    className="flex items-center justify-center gap-2 bg-red-50 text-red-500 px-5 py-3 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                    title="Remove item"
                                >
                                    <Trash2 size={16} />
                                    <span className="text-sm">Remove</span>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-xs">
                        <div className="bg-gray-50 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                            <HeartCrack className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-1">No saved quotes yet</h3>
                        <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium">
                            Bookmark highlights from your dashboard to display them here.
                        </p>
                    </div>
                )
            )}

            {/* --- RENDER TAB: SYSTEM SUGGESTIONS/REQUESTS --- */}
            {activeTab === 'requests' && (
                <div>
                    {/* Status Sub-Filters Selection Strip */}
                    <div className="flex gap-2 mb-6 bg-gray-200/50 p-1.5 rounded-2xl w-fit">
                        {(['pending', 'approved', 'rejected'] as RequestStatusFilter[]).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                                    statusFilter === status
                                        ? 'bg-white text-gray-900 shadow-xs'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {status === 'pending' && <Clock size={14} className="text-amber-500" />}
                                {status === 'approved' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                {status === 'rejected' && <XCircle size={14} className="text-red-500" />}
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Filtered Data Rendering Loop */}
                    {filteredRequests.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredRequests.map((req) => (
                                <div 
                                    key={req.id}
                                    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xs flex flex-col gap-4"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-gray-800 font-medium italic text-lg mb-3">
                                                "{req.text}"
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                                <span className="font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                    {req.book_title}
                                                </span>
                                                <span>•</span>
                                                <span>By {req.author || "Unknown Author"}</span>
                                                <span>•</span>
                                                <span>Submitted {new Date(req.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Action Status Badge Indicators */}
                                        <div className="shrink-0">
                                            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                                                req.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                                {req.status === 'pending' && <Clock size={12} />}
                                                {req.status === 'approved' && <CheckCircle2 size={12} />}
                                                {req.status === 'rejected' && <XCircle size={12} />}
                                                {req.status === 'approved' ? 'Approved' : req.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* --- DYNAMIC ADMIN FEEDBACK DISPLAY FOR REJECTIONS --- */}
                                    {req.status === 'rejected' && req.admin_feedback && (
                                        <div className="mt-2 flex items-start gap-2.5 p-4 bg-red-50/50 rounded-2xl border border-red-100/60 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="mt-0.5 shrink-0 text-red-500">
                                                <CornerDownRight size={16} className="hidden md:block" />
                                                <MessageSquareX size={16} className="block md:hidden" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-red-600 uppercase tracking-wider">
                                                    Moderator Feedback
                                                </p>
                                                <p className="text-sm text-gray-600 font-medium mt-0.5 leading-relaxed">
                                                    {req.admin_feedback}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-xs">
                            <div className="bg-gray-50 w-16 h-16 rounded-4xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <Inbox size={28} />
                            </div>
                            <h4 className="text-lg font-black text-gray-800 capitalize">No {statusFilter} Submissions</h4>
                            <p className="text-gray-400 text-sm font-medium mt-1">
                                Records matching this filter field are empty.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}