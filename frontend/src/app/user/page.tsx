'use client';
import { useEffect, useState } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { getUserShelves, syncStreak, getUserStreakandGoal } from "@/lib/user";
import BookCard from "@/components/Cards/BookCard";
import ProgressBookCard from "@/components/Cards/ProgressBookCard";
import { Flame } from "lucide-react";

export default function Dashboard() {
  const [books, setBooks] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<{
    current_streak: number;
    daily_reading_goal: number;
  } | null>(null);
  const [todayProgressSeconds, setTodayProgressSeconds] = useState(0); // Seconds from backend
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initDashboard() {
      try {
        await syncStreak();

        const [shelvesRes, streakRes] = await Promise.all([
          getUserShelves(),
          getUserStreakandGoal()
        ]);

        setBooks(shelvesRes.data || []);
        setStreakData(streakRes.data.data);
        setTodayProgressSeconds(streakRes.data.timeToday || 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, []);

  const currentlyReading = books.filter(b => b.shelf === 'currently_reading');
  const toRead = books.filter(b => b.shelf === 'to_read');

  if (loading) return <div className="pt-32 text-center font-main">Loading your library...</div>;

  const goalMinutes = streakData?.daily_reading_goal || 30;
  const goalSeconds = goalMinutes * 60;
  
  // Calculate progress based on seconds vs seconds
  const progressPercent = Math.min((todayProgressSeconds / goalSeconds) * 100, 100);
  const isGoalMet = todayProgressSeconds >= goalSeconds;

  // Convert seconds back to minutes for a friendly UI display
  const progressMinutes = Math.floor(todayProgressSeconds / 60);
  const minutesRemaining = Math.max(goalMinutes - progressMinutes, 0);

  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-main">
      <UserNav />
      
      <div className="max-w-7xl mx-auto pt-28 px-6">
        
        {/* --- STREAK SECTION --- */}
        <section className="mb-10">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
            
            {/* Streak Counter */}
            <div className="flex items-center gap-4 border-r border-gray-100 pr-8">
              <div className={`p-4 rounded-2xl ${isGoalMet ? 'bg-orange-100' : 'bg-gray-100'} transition-colors`}>
                <Flame className={isGoalMet ? "text-orange-500 fill-orange-500" : "text-gray-400"} size={40} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Current Streak</p>
                <h3 className="text-3xl font-black text-gray-900">{streakData?.current_streak || 0} Days</h3>
              </div>
            </div>

            {/* Daily Goal Progress */}
            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h4 className="font-bold text-gray-900">Daily Goal</h4>
                  <p className="text-xs text-gray-500">
                    {isGoalMet 
                      ? "Goal Achieved! Streak maintained." 
                      : `Read ${minutesRemaining} more minutes to keep your streak!`}
                  </p>
                </div>
                <span className="text-sm font-bold text-[#14919B]">
                  {progressMinutes} / {goalMinutes} min
                </span>
              </div>
              
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${isGoalMet ? 'bg-orange-500' : 'bg-[#14919B]'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Currently Reading / To Read*/}
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
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center">
               <p className="text-gray-400 italic">No books currently being read. Start an adventure!</p>
            </div>
          )}
        </section>

        <hr className="border-gray-200 mb-12" />

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