'use client';

import { useState, useEffect } from 'react';
import { getUserFriendChallenges, getSwapRequests } from '@/lib/user';
import { Bell, Sword, ArrowRight, Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import UserNav from '@/components/Navbar/UserNav';
import { useAuthContext } from '@/context/AuthContext';
import { io } from "socket.io-client";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const [challengeRes, swapRes] = await Promise.all([
          getUserFriendChallenges(),
          getSwapRequests()
        ]);

        // 1. Format Challenges
        const challenges = (challengeRes.data.data || [])
          .filter((c: any) => c.status === 'pending' && c.challenged_id === user?.id)
          .map((c: any) => ({ ...c, type: 'challenge' }));

        // 2. Format Book Requests (Received)
        const bookRequests = (swapRes.data.data.received || [])
          .filter((s: any) => s.status === 'pending')
          .map((s: any) => ({ ...s, type: 'book_request' }));

        setNotifications([...challenges, ...bookRequests].sort((a,b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchAllNotifications();

        // --- SOCKET LISTENER ---
        const socket = io(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000", {
            withCredentials: true
        });

        socket.on('new_notification', (data) => {
            setNotifications(prev => [data, ...prev]);
        });

        return () => { socket.disconnect(); };
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 font-main">
      <UserNav />
      <main className="max-w-3xl mx-auto pt-28 pb-12 px-6">
        <h1 className="text-2xl font-black mb-8 flex items-center gap-3 italic text-gray-900">
          <Bell className="text-[#14919B]" /> Notifications
        </h1>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#14919B]" size={32} /></div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((item, idx) => (
              <Link 
                href={item.type === 'challenge' ? "/user/challenges" : "/user/events"} 
                key={idx}
                className="block bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-[#14919B] transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${item.type === 'challenge' ? 'bg-amber-50 text-amber-600' : 'bg-[#14919B]/10 text-[#14919B]'}`}>
                      {item.type === 'challenge' ? <Sword size={22} /> : <MessageSquare size={22} />}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg">
                        {item.type === 'challenge' 
                            ? `${item.challenger_name} sent a challenge!` 
                            : `${item.sender_name} wants to swap books!`}
                      </p>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {item.type === 'challenge' ? "Action required" : `Book: ${item.book_title}`}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-200 group-hover:text-[#14919B] group-hover:translate-x-1 transition-all" size={24} />
                </div>
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-[#14919B]/5 transition-colors" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <Bell size={48} className="mx-auto text-gray-100 mb-4" />
            <p className="text-gray-400 font-black text-xl italic">Silence is golden...</p>
            <p className="text-gray-300 text-sm font-bold">No new notifications right now.</p>
          </div>
        )}
      </main>
    </div>
  );
}