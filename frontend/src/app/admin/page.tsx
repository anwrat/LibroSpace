'use client';

import { useEffect, useState } from "react";
import AdminNav from "@/components/Navbar/AdminNav";
import { getAllBooks, getAllGenres, getAllCommunities, getAllQuotes, getAllUsers } from '@/lib/admin';
import { BookOpen, SwatchBook, MessageSquare, Quote, Loader2, User } from "lucide-react";

interface DashboardCounts {
  books: number;
  genres: number;
  communities: number;
  quotes: number;
  users: number;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        // Fetch all data concurrently
        const [booksRes, genresRes, communitiesRes, quotesRes, usersRes] = await Promise.all([
          getAllBooks(),
          getAllGenres(),
          getAllCommunities(),
          getAllQuotes(),
          getAllUsers()
        ]);

        setCounts({
          books: booksRes?.data?.books?.length || 0,
          genres: genresRes?.data?.data?.length || 0,
          communities: communitiesRes?.data?.data?.length || 0,
          quotes: quotesRes?.data?.data?.length || 0,
          users: usersRes?.data?.users?.length || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard counts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <AdminNav />

      {/* Main Panel Content Area */}
      <main className="flex-1 ml-64 transition-all duration-300 p-8 font-main">
        
        {/* --- HEADER --- */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Welcome back to the flight deck. Here is an overview of LibroSpace data.
          </p>
        </div>

        {/* --- LOADING STATE --- */}
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Loader2 className="animate-spin text-[#14919B]" size={48} />
              <div className="absolute inset-0 m-auto w-2 h-2 bg-[#14919B] rounded-full"></div>
            </div>
            <p className="text-gray-400 font-bold text-lg animate-pulse tracking-tight">
              Aggregating Metrics...
            </p>
          </div>
        ) : (
          /* --- METRICS GRID --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <StatCard 
              title="Total Users" 
              value={counts?.users ?? 0} 
              icon={User} 
              color="text-emerald-500" 
              bg="bg-emerald-50" 
            />

            <StatCard 
              title="Total Books" 
              value={counts?.books ?? 0} 
              icon={BookOpen} 
              color="text-emerald-500" 
              bg="bg-emerald-50" 
            />

            <StatCard 
              title="Total Genres" 
              value={counts?.genres ?? 0} 
              icon={SwatchBook} 
              color="text-blue-500" 
              bg="bg-blue-50" 
            />

            <StatCard 
              title="Communities" 
              value={counts?.communities ?? 0} 
              icon={MessageSquare} 
              color="text-amber-500" 
              bg="bg-amber-50" 
            />

            <StatCard 
              title="Total Quotes" 
              value={counts?.quotes ?? 0} 
              icon={Quote} 
              color="text-purple-500" 
              bg="bg-purple-50" 
            />

          </div>
        )}
      </main>
    </div>
  );
}

// Reusable Metric Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  bg: string;
}

function StatCard({ title, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xs flex items-center justify-between group hover:border-[#14919B]/30 transition-all duration-300">
      <div>
        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{title}</p>
        <h2 className="text-4xl font-black text-gray-900 mt-2 tracking-tight">
          {value.toLocaleString()}
        </h2>
      </div>
      <div className={`h-14 w-14 ${bg} ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
        <Icon size={26} />
      </div>
    </div>
  );
}