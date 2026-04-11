'use client';

import { useEffect, useState, useMemo } from "react";
import { getUserShelves } from "@/lib/user";
import UserNav from "@/components/Navbar/UserNav";
import BookCard from "@/components/Cards/BookCard";
import ProgressBookCard from "@/components/Cards/ProgressBookCard";
import { Loader2, Library, BookOpen, CheckCircle, Bookmark } from "lucide-react";

type ShelfType = "currently_reading" | "to_read" | "read";

export default function MyShelvesPage() {
    const [allBooks, setAllBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ShelfType>("currently_reading");

    useEffect(() => {
        async function fetchShelves() {
            try {
                const res = await getUserShelves();
                // Assuming your API returns { data: [...] } based on previous context
                setAllBooks(res.data.data || res.data); 
            } catch (error) {
                console.error("Error fetching shelves:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchShelves();
    }, []);

    // Categorize books based on the 'shelf' property
    const filteredBooks = useMemo(() => {
        return allBooks.filter(book => book.shelf === activeTab);
    }, [allBooks, activeTab]);

    const tabs = [
        { id: "currently_reading", label: "Reading", icon: BookOpen },
        { id: "to_read", label: "Want to Read", icon: Bookmark },
        { id: "read", label: "Finished", icon: CheckCircle },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#14919B]" size={40} />
        </div>
    );

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto font-main">
            <UserNav />
            
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <Library className="text-[#14919B]" size={28} />
                    <h1 className="text-4xl font-black text-gray-900">My Library</h1>
                </div>
                <p className="text-gray-500 font-medium">Manage your reading journey and progress.</p>
            </header>

            {/* --- TAB SWITCHER --- */}
            <div className="flex flex-wrap gap-4 mb-10 border-b border-gray-100 pb-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ShelfType)}
                            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all relative
                                ${isActive ? 'text-[#14919B]' : 'text-gray-400 hover:text-gray-600'}
                            `}
                        >
                            <Icon size={18} />
                            {tab.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#14919B] rounded-t-full" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* --- BOOK GRID --- */}
            {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {filteredBooks.map((book) => (
                        activeTab === "currently_reading" ? (
                            <ProgressBookCard 
                                key={book.id} 
                                id={book.book_id}
                                title={book.title}
                                author={book.author}
                                cover_url={book.cover_url}
                                progress={book.progress || 0} 
                            />
                        ) : (
                            <BookCard 
                                key={book.id} 
                                id={book.book_id} 
                                title={book.title} 
                                author={book.author} 
                                cover_url={book.cover_url} 
                            />
                        )
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Bookmark className="text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-bold">No books in this shelf yet.</p>
                </div>
            )}
        </main>
    );
}