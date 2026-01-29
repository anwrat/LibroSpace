'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getBookbyID, addBooktoShelf, checkBookInShelf } from "@/lib/user";
import UserNav from "@/components/Navbar/UserNav";
import toast,{Toaster} from "react-hot-toast";

type ShelfType = "read" | "currently_reading" | "to_read" | null;

export default function BookDetailsPage() {
    const params = useParams();
    const bookId = params.id;
    
    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentShelf, setCurrentShelf] = useState<ShelfType>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        async function fetchBook() {
            try {
                const response = await getBookbyID(Number(bookId));
                setBook(response.data);
                const shelfCheck = await checkBookInShelf(Number(bookId));
                if(shelfCheck.data.inShelf){
                  setCurrentShelf(shelfCheck.data.shelf); 
                }
            } catch (error) {
                console.error("Error fetching books details: ", error);
            } finally {
                setLoading(false);
            }
        }
        if (bookId) fetchBook();
    }, [bookId]);

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
            toast.error("Failed to update shelf. Are you logged in?");
        } finally {
            setUpdating(false);
        }
    };

    const getButtonText = () => {
        if (updating) return "Updating...";
        if (!currentShelf) return "Add to My Shelf";
        return `Shelf: ${currentShelf.replace('_', ' ').toUpperCase()}`;
    };

    if (loading) return <div className="font-main pt-24 text-center">Loading....</div>;
    if (!book) return <div className="pt-24 text-center font-main">Book not found</div>;

    return (
        <main className="min-h-screen pt-24 px-6 max-w-7xl mx-auto font-main relative">
            <UserNav />
            <Toaster position = "top-center" reverseOrder={false}/>
            <div className="flex flex-col md:flex-row gap-10">
                <div className="relative w-full max-w-[300px] aspect-2/3 shadow-xl rounded-lg overflow-hidden">
                    <Image
                        src={book.cover_url || '/Placeholders/book-placeholder.png'}
                        alt={book.title}
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="flex-1">
                    <h1 className="text-4xl font-bold text-gray-900">{book.title}</h1>
                    <p className="text-xl text-gray-600 mt-2">By {book.author}</p>
                    
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold border-b pb-2">Description</h2>
                        <p className="mt-4 text-gray-700 leading-relaxed">
                            {book.description || "No description available for this book."}
                        </p>
                    </div>

                    <button 
                        onClick={() => setShowModal(true)}
                        disabled={updating}
                        className={`mt-10 px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer
                            ${currentShelf ? 'bg-gray-100 text-[#14919B] border-2 border-[#14919B]' : 'bg-[#14919B] text-white hover:bg-[#0f7178]'}
                        `}
                    >
                        {getButtonText()}
                    </button>
                </div>
            </div>

            {/* --- SHELF SELECTION MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                        onClick={() => setShowModal(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Select a Shelf</h3>
                        
                        <div className="flex flex-col gap-3">
                            {[
                                { id: 'to_read', label: 'Want to Read' },
                                { id: 'currently_reading', label: 'Currently Reading' },
                                { id: 'read', label: 'Finished Reading' },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleAddToShelf(option.id as ShelfType)}
                                    className={`w-full py-3 rounded-xl font-medium transition-all border cursor-pointer
                                        ${currentShelf === option.id 
                                            ? 'bg-[#14919B] text-white border-[#14919B]' 
                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#14919B] hover:text-[#14919B]'}
                                    `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setShowModal(false)}
                            className="mt-6 w-full text-gray-400 text-sm hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}