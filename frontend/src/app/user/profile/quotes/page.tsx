'use client';

import { useEffect, useState } from "react";
import { getSavedQuotes, toggleSaveQuote } from "@/lib/user";
import UserNav from "@/components/Navbar/UserNav";
import { Loader2, HeartCrack, Quote as QuoteIcon, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function SavedQuotesPage() {
    const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSaved() {
            try {
                const res = await getSavedQuotes();
                // Adjusting based on your typical API response structure { data: { data: [] } }
                setSavedQuotes(res.data.data || res.data);
            } catch (error) {
                console.error("Error fetching saved quotes:", error);
                toast.error("Failed to load your saved quotes.");
            } finally {
                setLoading(false);
            }
        }
        fetchSaved();
    }, []);

    const handleRemoveQuote = async (quoteId: number) => {
        try {
            await toggleSaveQuote(quoteId);
            
            // Filter out the removed quote from the local state immediately
            setSavedQuotes(prev => prev.filter(q => q.id !== quoteId));
            
            toast.success("Quote removed from library");
        } catch (error) {
            console.error("Error removing quote:", error);
            toast.error("Could not remove the quote. Try again.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#14919B]" size={40} />
        </div>
    );

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 max-w-5xl mx-auto font-main">
            <UserNav />
            <Toaster position="top-center" />

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <QuoteIcon className="text-[#14919B]" size={28} />
                    <h1 className="text-4xl font-black text-gray-900">Saved Quotes</h1>
                </div>
                <p className="text-gray-500 font-medium">Your personal collection of literary inspiration.</p>
            </header>

            {savedQuotes.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {savedQuotes.map((quote) => (
                        <div 
                            key={quote.id} 
                            className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            {/* Decorative accent */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#14919B]/10 group-hover:bg-[#14919B] transition-colors" />

                            <div className="flex-1">
                                <p className="text-gray-700 text-xl leading-relaxed italic mb-3 pr-4">
                                    "{quote.content}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-[#14919B] bg-[#14919B]/5 px-3 py-1 rounded-lg">
                                        {quote.book_title}
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
                                className="flex items-center justify-center gap-2 bg-red-50 text-red-500 px-6 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                title="Remove from saved"
                            >
                                <Trash2 size={18} />
                                <span className="md:hidden lg:inline text-sm">Remove</span>
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <HeartCrack className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No saved quotes yet</h3>
                    <p className="text-gray-400 max-w-xs mx-auto">
                        Start exploring books and save quotes that resonate with you!
                    </p>
                </div>
            )}
        </main>
    );
}