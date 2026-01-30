'use client';
import { useEffect, useState } from 'react';
import BookCard from '@/components/Cards/BookCard';
import UserNav from '@/components/Navbar/UserNav';
import { getAllBooksforUser } from '@/lib/user';

export default function ExplorePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="min-h-screen bg-white pt-24 px-4 sm:px-8 pb-12 font-main">
        <UserNav />
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Explore</h1>
          <p className="text-gray-500 text-lg mt-2">Find your next favorite book in our collection.</p>
        </div>

        {loading ? (
          /* Loading Skeleton Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-2/3 w-full bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          /* Actual Book Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {books?.map((book: any) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        )}

        {!loading && books.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-lg">No books found. Check back later!</p>
          </div>
        )}
      </div>
    </main>
  );
}