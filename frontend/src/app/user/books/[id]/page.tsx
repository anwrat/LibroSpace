'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  getBookbyID, 
  addBooktoShelf, 
  checkBookInShelf, 
  startReadingSession,
  getQuotesForBook,
  toggleSaveQuote,
  getSavedQuotes 
} from "@/lib/user";
import UserNav from "@/components/Navbar/UserNav";
import toast, { Toaster } from "react-hot-toast";
import { Play, Loader2, BookmarkPlus, Heart } from "lucide-react";

type ShelfType = "read" | "currently_reading" | "to_read" | null;

export default function BookDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const bookId = params.id;
    
    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentShelf, setCurrentShelf] = useState<ShelfType>(null);
    const [updating, setUpdating] = useState(false);
    const [quotes, setQuotes] = useState<any[]>([]);
    const [savedQuoteIds, setSavedQuoteIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getBookbyID(Number(bookId));
                setBook(response.data);
                
                const shelfCheck = await checkBookInShelf(Number(bookId));
                if(shelfCheck.data.inShelf){
                  setCurrentShelf(shelfCheck.data.shelf); 
                }
                
                const [quotesRes, savedRes] = await Promise.all([
                    getQuotesForBook(Number(bookId)),
                    getSavedQuotes()
                ]);

                setQuotes(quotesRes.data.data);
                const savedIds = new Set<number>(savedRes.data.data.map((q: any) => q.id));
                setSavedQuoteIds(savedIds);
            } catch (error) {
                console.error("Error fetching books details: ", error);
            } finally {
                setLoading(false);
            }
        }
        if (bookId) fetchData();
    }, [bookId]);

    const handleToggleSave = async (quoteId: number) => {
        try {
            const res = await toggleSaveQuote(quoteId);
            
            // Update local state UI instantly
            setSavedQuoteIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(quoteId)) {
                    newSet.delete(quoteId);
                    toast.success("Removed from saved");
                } else {
                    newSet.add(quoteId);
                    toast.success("Quote saved!");
                }
                return newSet;
            });
        } catch (error) {
            toast.error("Failed to update saved quotes");
        }
    };

    const handleStartSession = async () => {
        setUpdating(true);
        try {
            const res = await startReadingSession(Number(bookId), 0);
            if (res.data.data.id) {
                toast.success("Opening notebook...");
                router.push(`/user/books/${bookId}/session/${res.data.data.id}`);
            }
        } catch (error: any) {
            console.error("Session start error:", error);
            toast.error(error.response?.data?.message || "Could not start session.");
        } finally {
            setUpdating(false);
        }
    };

    const handleAddToShelf = async (shelf: ShelfType) => {
        if (!shelf || !bookId) return;
        
        setUpdating(true);
        try {
            await addBooktoShelf(Number(bookId), shelf);
            setCurrentShelf(shelf);
            setShowModal(false);
            toast.success(`Book moved to ${shelf.replace('_', ' ')}`);
        } catch (error) {
            console.error("Error updating shelf:", error);
            toast.error("Failed to update shelf.");
        } finally {
            setUpdating(false);
        }
    };

    const getButtonText = () => {
        if (updating) return "Updating...";
        if (!currentShelf) return "Add to My Shelf";
        return `Shelf: ${currentShelf.replace('_', ' ').toUpperCase()}`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#14919B]" size={40} />
        </div>
    );
    
    if (!book) return <div className="pt-24 text-center font-main">Book not found</div>;

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto font-main relative">
            <UserNav />
            <Toaster position="top-center" reverseOrder={false}/>
            
            <div className="flex flex-col md:flex-row gap-12">
                {/* --- LEFT COLUMN: COVER & PRIMARY ACTIONS --- */}
                <div className="flex flex-col items-center gap-6 w-full max-w-[320px] mx-auto md:mx-0">
                    <div className="relative w-full aspect-2/3 shadow-2xl rounded-[2rem] overflow-hidden border-8 border-white">
                        <Image
                            src={book.cover_url || '/Placeholders/book-placeholder.png'}
                            alt={book.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Start Reading Session Button (Only for currently_reading) */}
                    {currentShelf === 'currently_reading' && (
                        <button 
                            onClick={handleStartSession}
                            disabled={updating}
                            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-5 rounded-[1.5rem] font-bold hover:bg-[#14919B] transition-all shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-70"
                        >
                            {updating ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <div className="bg-[#14919B] p-1.5 rounded-full">
                                        <Play size={16} fill="white" className="ml-0.5" />
                                    </div>
                                    Start Reading Session
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* --- RIGHT COLUMN: DETAILS --- */}
                <div className="flex-1">
                    <div className="mb-8">
                        {/* Render multiple spans if genres exist, otherwise show a default */}
                        <div className="flex flex-wrap gap-2">
                            {book.genres && book.genres.length > 0 ? (
                                book.genres.map((g: string, index: number) => (
                                    <span 
                                        key={index}
                                        className="text-[#14919B] font-bold text-xs uppercase tracking-widest bg-[#14919B]/10 px-4 py-1.5 rounded-full"
                                    >
                                        {g}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full">
                                    No Genre
                                </span>
                            )}
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 mt-4 tracking-tight leading-tight">
                            {book.title}
                        </h1>
                        <p className="text-2xl text-gray-500 mt-2 font-medium">By {book.author}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Pages</p>
                            <p className="text-xl font-black text-gray-900">{book.pagecount || "N/A"}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Language</p>
                            <p className="text-xl font-black text-gray-900">English</p>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                           Description
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {book.description || "No description available for this book."}
                        </p>
                    </div>

                    <button 
                        onClick={() => setShowModal(true)}
                        disabled={updating}
                        className={`px-10 py-4 rounded-[1.5rem] font-bold text-lg transition-all shadow-lg flex items-center gap-3
                            ${currentShelf 
                                ? 'bg-white text-[#14919B] border-2 border-[#14919B] hover:bg-[#14919B]/5' 
                                : 'bg-[#14919B] text-white hover:bg-[#0f7178] shadow-[#14919B]/20'}
                        `}
                    >
                        <BookmarkPlus size={22} />
                        {getButtonText()}
                    </button>
                </div>
            </div>

            {/* --- QUOTES SECTION --- */}
            <section className="mt-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black text-gray-900">Notable Quotes</h2>
                    <span className="text-sm font-bold text-[#14919B] bg-[#14919B]/10 px-4 py-1 rounded-full">
                        {quotes.length} Quotes found
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quotes.map((quote) => {
                        const isSaved = savedQuoteIds.has(quote.id);
                        return (
                            <div key={quote.id} className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#14919B]/20 group-hover:bg-[#14919B] transition-colors" />
                                
                                <button 
                                    onClick={() => handleToggleSave(quote.id)}
                                    className="absolute top-6 right-6 p-2 rounded-full transition-all active:scale-90"
                                >
                                    <Heart 
                                        size={24} 
                                        className={isSaved ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-400"} 
                                    />
                                </button>

                                <p className="text-gray-700 text-base leading-relaxed italic mb-4 pr-8">
                                    "{quote.content}"
                                </p>
                                
                                {quote.page_number && (
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Page {quote.page_number}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {quotes.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No quotes shared for this book yet.</p>
                    </div>
                )}
            </section>

            {/* --- SHELF SELECTION MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" 
                        onClick={() => !updating && setShowModal(false)}
                    />
                    
                    <div className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-2xl font-black text-gray-900 mb-2 text-center">Move to Shelf</h3>
                        <p className="text-gray-500 text-sm text-center mb-8">Where are you in your reading journey?</p>
                        
                        <div className="flex flex-col gap-4">
                            {[
                                { id: 'to_read', label: 'Want to Read' },
                                { id: 'currently_reading', label: 'Currently Reading' },
                                { id: 'read', label: 'Finished Reading' },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    disabled={updating}
                                    onClick={() => handleAddToShelf(option.id as ShelfType)}
                                    className={`w-full py-4 rounded-2xl font-bold transition-all border-2 
                                        ${currentShelf === option.id 
                                            ? 'bg-[#14919B] text-white border-[#14919B] shadow-lg shadow-[#14919B]/20' 
                                            : 'bg-gray-50 text-gray-700 border-transparent hover:border-[#14919B] hover:bg-white'}
                                    `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setShowModal(false)}
                            className="mt-8 w-full text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors uppercase tracking-widest"
                        >
                            Nevermind
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}