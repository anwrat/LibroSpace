"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/Navbar/AdminNav";
import {
  getAllBooks,
  getAllGenres,
  getAllCommunities,
  getAllQuotes,
  getAllUsers,
  getAllQuoteRequests,
} from "@/lib/admin";
import {
  BookOpen,
  SwatchBook,
  MessageSquare,
  Quote,
  Loader2,
  User,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import StatCard from "@/components/Cards/StatCard";
import Link from "next/link";

interface DashboardCounts {
  books: number;
  genres: number;
  communities: number;
  quotes: number;
  users: number;
  pendingQuotes: number;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        // Fetch all data concurrently
        const [
          booksRes,
          genresRes,
          communitiesRes,
          quotesRes,
          usersRes,
          quoteRequestsRes,
        ] = await Promise.all([
          getAllBooks(),
          getAllGenres(),
          getAllCommunities(),
          getAllQuotes(),
          getAllUsers(),
          getAllQuoteRequests(),
        ]);

        // Filter for pending quote requests
        const allRequests =
          quoteRequestsRes?.data?.data || quoteRequestsRes?.data || [];
        const pendingCount = allRequests.filter(
          (req: any) => req.status === "pending",
        ).length;

        setCounts({
          books: booksRes?.data?.books?.length || 0,
          genres: genresRes?.data?.data?.length || 0,
          communities: communitiesRes?.data?.data?.length || 0,
          quotes: quotesRes?.data?.data?.length || 0,
          users: usersRes?.data?.users?.length || 0,
          pendingQuotes: pendingCount,
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
            Welcome back. Here is an overview of LibroSpace data.
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
          <div className="space-y-8">
            {/* --- ATTENTION-GRABBING ACTIONS LAYER --- */}
            {(counts?.pendingQuotes ?? 0) > 0 && (
              <div className="relative overflow-hidden bg-linear-to-r from-amber-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-500/10 animate-in fade-in slide-in-from-top-4 duration-500 group">
                {/* Decorative background vectors */}
                <div className="absolute -right-10 -bottom-10 text-white/10 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                  <ClipboardCheck size={240} />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl shrink-0 relative mt-1">
                      <ClipboardCheck size={28} className="text-amber-100" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] bg-white/20 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                        Moderation Alert
                      </span>
                      <h2 className="text-2xl font-black mt-2 tracking-tight">
                        {counts?.pendingQuotes} Quote Submissions Awaiting
                        Review
                      </h2>
                      <p className="text-amber-100/80 text-sm font-medium mt-1 max-w-xl">
                        Users have submitted new community quotes that need your
                        verification before appearing live on public feeds.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/requests"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-orange-600 rounded-2xl font-black text-sm shadow-md hover:bg-orange-50 transition-all shrink-0 active:scale-98 group"
                  >
                    Review Submissions
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            )}

            {/* --- METRICS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
          </div>
        )}
      </main>
    </div>
  );
}
