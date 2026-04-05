'use client';
import AdminNav from "@/components/Navbar/AdminNav";
import { getAllBooks, getAllGenres, addNewGenre, deleteGenre } from "@/lib/admin";
import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Search, Plus, Trash2, Tag } from "lucide-react";
import { Button, TextField } from "@mui/material";
import AddBookForm from "@/components/Forms/AddBookForm";

interface BookType {
    id: number;
    title: string;
    author: string;
    description: string;
    cover_url: string;
    published_date: string;
    language: string;
}

interface GenreType {
    id: number;
    name: string;
}

export default function Books() {
    const [books, setBooks] = useState<BookType[]>([]);
    const [genres, setGenres] = useState<GenreType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Pagination and Search for Books
    const [bookPage, setBookPage] = useState(1);
    const [bookSearch, setBookSearch] = useState('');
    const booksPerPage = 5;

    // Pagination and Search for Genres
    const [genrePage, setGenrePage] = useState(1);
    const [genreSearch, setGenreSearch] = useState('');
    const [newGenreName, setNewGenreName] = useState('');
    const genresPerPage = 5;

    const [showAddBookForm, setShowAddBookForm] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [booksRes, genresRes] = await Promise.all([
                getAllBooks(),
                getAllGenres()
            ]);
            setBooks(booksRes.data.books || []);
            setGenres(genresRes.data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- GENRE HANDLERS ---
    const handleAddGenre = async () => {
        if (!newGenreName.trim()) return;
        try {
            await addNewGenre(newGenreName.trim());
            setNewGenreName('');
            fetchData(); // Refresh list
        } catch (err) {
            alert("Failed to add genre");
        }
    };

    const handleDeleteGenre = async (id: number) => {
        if (!confirm("Are you sure you want to delete this genre?")) return;
        try {
            await deleteGenre(id);
            fetchData();
        } catch (err) {
            alert("Failed to delete genre");
        }
    };

    // --- FILTERING & PAGINATION LOGIC ---
    const filteredBooks = books.filter(b => b.title.toLowerCase().includes(bookSearch.toLowerCase()));
    const filteredGenres = genres.filter(g => g.name.toLowerCase().includes(genreSearch.toLowerCase()));

    const currentBooks = filteredBooks.slice((bookPage - 1) * booksPerPage, bookPage * booksPerPage);
    const currentGenres = filteredGenres.slice((genrePage - 1) * genresPerPage, genrePage * genresPerPage);

    const totalBookPages = Math.ceil(filteredBooks.length / booksPerPage);
    const totalGenrePages = Math.ceil(filteredGenres.length / genresPerPage);

    if (loading) return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminNav />
            <div className="flex-1 flex items-center justify-center ml-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14919B]"></div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminNav />
            
            <div className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-main text-gray-800 mb-2">Library Dashboard</h1>
                    <p className="text-gray-600 font-main">Manage your books and categorization system</p>
                </div>

                {/* STATS SECTION */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-linear-to-r from-[#14919B] to-[#0d6169] rounded-xl p-6 shadow-lg flex items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-lg"><BookOpen size={32} className="text-white" /></div>
                        <div>
                            <p className="text-white/80 font-main text-sm uppercase tracking-wider">Total Books</p>
                            <p className="text-white font-bold text-4xl font-main">{books.length}</p>
                        </div>
                    </div>
                    <div className="bg-linear-to-r from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg flex items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-lg"><Tag size={32} className="text-white" /></div>
                        <div>
                            <p className="text-white/80 font-main text-sm uppercase tracking-wider">Total Genres</p>
                            <p className="text-white font-bold text-4xl font-main">{genres.length}</p>
                        </div>
                    </div>
                </div>

                {/* --- BOOKS MANAGEMENT SECTION --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black font-main text-gray-800 uppercase tracking-tight">Books Inventory</h2>
                        <Button 
                            variant="contained" 
                            startIcon={<Plus />}
                            sx={{bgcolor:'#14919B', '&:hover':{bgcolor:'#0d6169'}, borderRadius: '12px', px: 3}}
                            onClick={()=>setShowAddBookForm(true)}
                        >
                            Add New Book
                        </Button>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search books..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#14919B]/20 outline-none transition-all font-main"
                            onChange={(e) => { setBookSearch(e.target.value); setBookPage(1); }}
                        />
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">ID</th>
                                <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">Title</th>
                                <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">Author</th>
                                <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Published</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentBooks.map((book) => (
                                <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-4 text-sm font-bold text-gray-400">#{book.id}</td>
                                    <td className="py-4 px-4 text-sm font-black text-gray-800">{book.title}</td>
                                    <td className="py-4 px-4 text-sm text-gray-600 italic">{book.author}</td>
                                    <td className="py-4 px-4 text-sm text-gray-500 text-right">{new Date(book.published_date).getFullYear()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Book Pagination */}
                    <div className="mt-6 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase">Page {bookPage} of {totalBookPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setBookPage(p => Math.max(1, p-1))} className="p-2 border rounded-lg hover:bg-gray-50"><ChevronLeft size={18}/></button>
                            <button onClick={() => setBookPage(p => Math.min(totalBookPages, p+1))} className="p-2 border rounded-lg hover:bg-gray-50"><ChevronRight size={18}/></button>
                        </div>
                    </div>
                </div>

                {/* --- GENRE MANAGEMENT SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Genre Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <h3 className="text-lg font-black font-main text-gray-800 mb-4 uppercase tracking-tight">Create Genre</h3>
                        <div className="space-y-4">
                            <TextField 
                                fullWidth 
                                label="Genre Name" 
                                variant="outlined" 
                                value={newGenreName}
                                onChange={(e) => setNewGenreName(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                            <Button 
                                fullWidth 
                                variant="contained" 
                                onClick={handleAddGenre}
                                sx={{bgcolor:'#14919B', py: 1.5, borderRadius: '12px'}}
                            >
                                Add Genre
                            </Button>
                        </div>
                    </div>

                    {/* Genre List Table */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black font-main text-gray-800 uppercase tracking-tight">Genre List</h3>
                            <div className="relative w-48">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Filter..."
                                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#14919B] outline-none"
                                    onChange={(e) => { setGenreSearch(e.target.value); setGenrePage(1); }}
                                />
                            </div>
                        </div>

                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-50">
                                    <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-widest">Genre ID</th>
                                    <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-widest">Name</th>
                                    <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentGenres.map((genre) => (
                                    <tr key={genre.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                        <td className="py-3 text-sm font-bold text-gray-400">#{genre.id}</td>
                                        <td className="py-3 text-sm font-black text-gray-800">{genre.name}</td>
                                        <td className="py-3 text-right">
                                            <button 
                                                onClick={() => handleDeleteGenre(genre.id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Genre Pagination */}
                        <div className="mt-6 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-300 uppercase italic">Total {filteredGenres.length} Categories</span>
                            <div className="flex gap-2">
                                <button onClick={() => setGenrePage(p => Math.max(1, p-1))} className="p-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-30" disabled={genrePage === 1}><ChevronLeft size={16}/></button>
                                <button onClick={() => setGenrePage(p => Math.min(totalGenrePages, p+1))} className="p-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-30" disabled={genrePage === totalGenrePages}><ChevronRight size={16}/></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Book Modal Overlay */}
                {showAddBookForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setShowAddBookForm(false)}/>
                        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <AddBookForm onClose={()=>setShowAddBookForm(false)} onRefresh={fetchData}/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}