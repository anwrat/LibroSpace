'use client';
import { useEffect, useState } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { getUserShelves } from "@/lib/user";
import BookCard from "@/components/Cards/BookCard";
import ProgressBookCard from "@/components/Cards/ProgressBookCard";

export default function Dashboard() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShelves() {
      try {
        const res = await getUserShelves();
        setBooks(res.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchShelves();
  }, []);

  const currentlyReading = books.filter(b => b.shelf === 'currently_reading');
  const toRead = books.filter(b => b.shelf === 'to_read');

  if (loading) return <div className="pt-32 text-center font-main">Loading your library...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-main">
      <UserNav />
      
      <div className="max-w-7xl mx-auto pt-28 px-6">
        
        {/* Section 1: Currently Reading */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Currently Reading</h2>
            <span className="bg-[#14919B]/10 text-[#14919B] px-3 py-1 rounded-full text-xs font-bold">
              {currentlyReading.length} Books
            </span>
          </div>
          
          {currentlyReading.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {currentlyReading.map((book) => (
                <ProgressBookCard 
                  key={book.id} 
                  id={book.book_id}
                  title={book.title}
                  author={book.author}
                  cover_url={book.cover_url}
                  progress={book.progress || 0} 
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No books currently being read. Start an adventure!</p>
          )}
        </section>

        <hr className="border-gray-200 mb-12" />

        {/* Section 2: To Read */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">To Read</h2>
            <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
              {toRead.length} Books
            </span>
          </div>

          {toRead.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {toRead.map((book) => (
                <BookCard key={book.id} id={book.book_id} title={book.title} author={book.author} cover_url={book.cover_url} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">Your "To Read" list is empty. Explore some books!</p>
          )}
        </section>

      </div>
    </main>
  );
}