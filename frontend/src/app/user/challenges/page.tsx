'use client';

import { useEffect, useState } from "react";
import UserNav from "@/components/Navbar/UserNav";
import GoalGauge from "@/components/User/Gamification/GoalGauge";
import { getUserStreakandGoal } from "@/lib/user";
import FriendChallenges from "@/components/User/Gamification/FriendChallenges";
import ChallengeHistory from "@/components/User/Gamification/ChallengeHistory";

export default function ChallengesPage() {
  const [data, setData] = useState<{
    current_streak: number;
    daily_reading_goal: number;
    timeToday: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await getUserStreakandGoal();
      setData({
        current_streak: res.data.data.current_streak,
        daily_reading_goal: res.data.data.daily_reading_goal,
        timeToday: res.data.timeToday
      });
    } catch (err) {
      console.error("Error loading challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="pt-32 text-center font-main">Loading Challenges...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-main">
      <UserNav />

      <div className="max-w-7xl mx-auto pt-28 px-6">
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-gray-900">Challenges</h1>
          <p className="text-gray-500">Push your limits and grow your library.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Top Component: Goal Gauge */}
          <div className="lg:col-span-1">
            <GoalGauge 
              currentSeconds={data?.timeToday || 0} 
              goalMinutes={data?.daily_reading_goal || 30}
              onGoalUpdate={(newGoal) => setData(prev => prev ? {...prev, daily_reading_goal: newGoal} : null)}
            />
            
            {/* Quick Streak Tip */}
            <div className="mt-6 bg-[#14919B]/5 border border-[#14919B]/10 rounded-2xl p-4 text-center">
               <p className="text-sm text-[#14919B] font-medium">
                 🔥 You are on a <strong>{data?.current_streak}-day</strong> streak!
               </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <FriendChallenges />
            <ChallengeHistory />
          </div>
        </div>
      </div>
    </main>
  );
}