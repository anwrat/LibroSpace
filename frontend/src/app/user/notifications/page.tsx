'use client';

import { useState, useEffect } from 'react';
import { getUserFriendChallenges } from '@/lib/user';
import { Bell, Sword, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import UserNav from '@/components/Navbar/UserNav';
import { useAuthContext } from '@/context/AuthContext';

export default function NotificationsPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuthContext();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getUserFriendChallenges();
        // Filter only pending ones for the notification list and if the user is the receiver
        const pending = (res.data.data || []).filter((c: any) => c.status === 'pending' && c.challenged_id === user?.id);
        setChallenges(pending);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-main">
      <UserNav />
      <main className="max-w-3xl mx-auto pt-28 pb-12 px-6">
        <h1 className="text-2xl font-black mb-8 flex items-center gap-3">
          <Bell className="text-[#14919B]" /> Notifications
        </h1>

        {loading ? (
          <div className="flex justify-center"><Loader2 className="animate-spin text-[#14919B]" /></div>
        ) : challenges.length > 0 ? (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Link 
                href="/user/challenges" 
                key={challenge.id}
                className="block bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-[#14919B] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#14919B]/10 p-3 rounded-2xl">
                      <Sword className="text-[#14919B]" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {challenge.challenger_name} <span className="font-medium text-gray-500">sent you a challenge!</span>
                      </p>
                      <p className="text-sm text-gray-400">Check it out in your challenges page</p>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-300 group-hover:text-[#14919B] group-hover:translate-x-1 transition-all" size={20} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No new notifications</p>
          </div>
        )}
      </main>
    </div>
  );
}