'use client';
import AdminNav from "@/components/Navbar/AdminNav";
import { getAllBooks } from "@/lib/admin";
import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@mui/material";

interface BookType {
    id: number;
    title: string;
    author: string;
    description: string;
    cover_url: string;
    published_date: string;
    language: string;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export default function Books() {
    const [books, setBooks] = useState<BookType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    
    const booksPerPage = 5;
    
    // Fetch books on component mount
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await getAllBooks();
                setBooks(response.data.books);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load books');
            } finally {
                setLoading(false);
            }
        };
        
        fetchBooks();
    }, []);
    
    // Filter books based on search
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Calculate pagination
    const totalBooks = filteredBooks.length;
    const totalPages = Math.ceil(totalBooks / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const currentBooks = filteredBooks.slice(startIndex, endIndex);
    
    // Pagination handlers
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    const goToPage = (page: number) => {
        setCurrentPage(page);
    };
    
    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminNav />
                <div className="flex-1 flex items-center justify-center ml-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14919B]"></div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminNav />
                <div className="flex-1 flex items-center justify-center ml-64">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
                        <p className="font-main">{error}</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminNav />
            
            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-main text-gray-800 mb-2">
                        Book Management
                    </h1>
                    <p className="text-gray-600 font-main">
                        Add/update/remove books in the system
                    </p>
                </div>
                
                {/* Stats Card */}
                <div className="bg-linear-to-r from-[#14919B] to-[#0d6169] rounded-xl p-6 shadow-lg mb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-lg">
                            <BookOpen size={32} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 font-main text-sm">Total Books</p>
                            <p className="text-white font-bold text-4xl font-main">{totalBooks}</p>
                        </div>
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name of book or author..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14919B] focus:border-transparent font-main"
                        />
                    </div>
                </div>
                
                <Button variant="contained" size="large" sx={{bgcolor:'#14919B', '&:hover':{bgcolor:'#155C62'}, fontFamily:'var(--font-main)'}}>Add a book</Button>

                {/* Books Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-main">
                                    ID
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-main">
                                    Title
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-main">
                                    Author
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-main">
                                    Published Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentBooks.length > 0 ? (
                                currentBooks.map((book) => (
                                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-700 font-main">
                                            {book.id}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 font-main">
                                            {book.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-main">
                                            {book.author}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-main">
                                            {new Date(book.published_date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-main">
                                        No books found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-gray-700 font-main">
                            Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                            <span className="font-semibold">{Math.min(endIndex, totalBooks)}</span> of{' '}
                            <span className="font-semibold">{totalBooks}</span> books
                        </p>
                        
                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            {/* Page Numbers */}
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`
                                            px-4 py-2 rounded-lg font-main text-sm font-medium transition-colors
                                            ${currentPage === page
                                                ? 'bg-[#14919B] text-white'
                                                : 'border border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Next Button */}
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}