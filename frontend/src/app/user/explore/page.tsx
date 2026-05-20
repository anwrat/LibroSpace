'use client';

import { useEffect, useState, useMemo } from 'react';
import BookCard from '@/components/Cards/BookCard';
import UserNav from '@/components/Navbar/UserNav';
import { getAllBooksforUser } from '@/lib/user';
import { BookOpen, Layers, SlidersHorizontal, Layers2 } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  cover_url: string;
  published_date: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  pagecount: number;
  genres: string[];
}

export default function ExplorePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [maxPageCount, setMaxPageCount] = useState<number>(1000);

  useEffect(() => {
    async function getBooks() {
      try {
        const res = await getAllBooksforUser();
        setBooks(res.data || []);
      } catch (err) {
        console.error("Error loading explore page:", err);
      } finally {
        setLoading(false);
      }
    }
    getBooks();
  }, []);

  // Compute absolute dynamic bounds from raw data records
  const dynamicMaxPages = useMemo(() => {
    if (books.length === 0) return 1000;
    return Math.max(...books.map(b => b.pagecount || 0), 1000);
  }, [books]);

  // Set the structural fallback cap whenever new dynamic loads finalize
  useEffect(() => {
    if (books.length > 0) {
      const highestPage = Math.max(...books.map(b => b.pagecount || 0));
      setMaxPageCount(highestPage);
    }
  }, [books]);

  // 1. Extract Unique Available Genres for the Filtering Panel
  const allAvailableGenres = useMemo(() => {
    const genresSet = new Set<string>();
    books.forEach(book => {
      if (book.genres && book.genres.length > 0) {
        book.genres.forEach(g => genresSet.add(g));
      } else {
        genresSet.add("Uncategorized");
      }
    });
    return ['All', ...Array.from(genresSet).sort()];
  }, [books]);

  // 2. Filter and Group books contextually based on state parameters
  const groupedAndFilteredBooks = useMemo(() => {
    // Stage A: Filter collections down by metrics first
    const runningFilteredList = books.filter(book => {
      const matchesPageCount = (book.pagecount || 0) <= maxPageCount;
      
      if (selectedGenre === 'All') return matchesPageCount;
      if (selectedGenre === 'Uncategorized') {
        return matchesPageCount && (!book.genres || book.genres.length === 0);
      }
      return matchesPageCount && book.genres?.includes(selectedGenre);
    });

    // Stage B: Assemble the structured map
    const groupings: Record<string, Book[]> = {};

    runningFilteredList.forEach(book => {
      const targetGenres = book.genres && book.genres.length > 0 ? book.genres : ['Uncategorized'];
      
      targetGenres.forEach(genre => {
        // Skip map allocation if it doesn't align with explicit filter selection states
        if (selectedGenre !== 'All' && selectedGenre !== genre) return;

        if (!groupings[genre]) {
          groupings[genre] = [];
        }
        // Protect grouping collection against double assignments inside multi-genre tags
        if (!groupings[genre].some(b => b.id === book.id)) {
          groupings[genre].push(book);
        }
      });
    });

    return groupings;
  }, [books, selectedGenre, maxPageCount]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-24 px-4 sm:px-8 pb-12 font-main">
      <UserNav />
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER BLOCK --- */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="text-[#14919B]" size={32} />
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Explore Library</h1>
            </div>
            <p className="text-gray-500 font-medium">Find your next favorite book sorted across global collections.</p>
          </div>
        </header>

        {/* --- DYNAMIC FILTER CONTROLS CONSOLE --- */}
        {!loading && books.length > 0 && (
          <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xs mb-10 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-gray-700 font-black text-sm uppercase tracking-wider">
              <SlidersHorizontal size={16} className="text-[#14919B]" />
              <span>Refine Collection</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Genre Filter Pills Strip */}
              <div className="lg:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Filter By Genre</p>
                <div className="flex flex-wrap gap-2">
                  {allAvailableGenres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        selectedGenre === genre
                          ? 'bg-[#14919B] text-white shadow-md shadow-[#14919B]/20'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Count Slider Controls */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="pagecount-slider" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Max Length
                  </label>
                  <span className="text-xs font-black text-[#14919B] bg-[#14919B]/5 px-2.5 py-1 rounded-lg">
                    {maxPageCount} Pages
                  </span>
                </div>
                <input
                  id="pagecount-slider"
                  type="range"
                  min="0"
                  max={dynamicMaxPages}
                  value={maxPageCount}
                  onChange={(e) => setMaxPageCount(Number(e.target.value))}
                  className="w-full accent-[#14919B] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1.5">
                  <span>0 pgs</span>
                  <span>{dynamicMaxPages} pgs</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- MAIN DISPLAY FIELD VIEW --- */}
        {loading ? (
          /* Loading Skeleton Grid Component Blueprint */
          <div className="space-y-10">
            {[1, 2].map((groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-2/3 w-full bg-gray-100 animate-pulse rounded-[1.5rem]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(groupedAndFilteredBooks).length > 0 ? (
          /* Segmented Categorized Book Grid Layout Loop */
          <div className="space-y-12">
            {Object.entries(groupedAndFilteredBooks).map(([genre, genreBooks]) => (
              <section key={genre} className="space-y-5 animate-in fade-in duration-300">
                
                {/* Segment Divider Label Header */}
                <div className="flex items-center gap-2 border-b border-gray-200/60 pb-2">
                  <Layers size={18} className="text-[#14919B]" />
                  <h2 className="text-xl font-black text-gray-800 tracking-tight capitalize">
                    {genre}
                  </h2>
                  <span className="ml-1 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                    {genreBooks.length}
                  </span>
                </div>

                {/* Sub Grid Mapping Array */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {genreBooks.map((book) => (
                    <BookCard key={book.id} {...book} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Dynamic Empty Structural Result State Screen */
          <div className="py-24 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-xs max-w-xl mx-auto">
            <div className="bg-gray-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Layers2 size={28} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-1">No Books Match Criteria</h3>
            <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">
              Try adjusting your filter toggles or changing the length threshold to explore other options.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}