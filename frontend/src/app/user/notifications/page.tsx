'use client';

import { useState, useEffect } from 'react';
import { getUserFriendChallenges, getSwapRequests, getAcceptedSwaps } from '@/lib/user';
import { Bell, Sword, ArrowRight, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import UserNav from '@/components/Navbar/UserNav';
import { useAuthContext } from '@/context/AuthContext';
import { io } from "socket.io-client";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const fetchAllNotifications = async () => {
      try {
        const [challengeRes, swapRes, acceptedRes] = await Promise.all([
          getUserFriendChallenges(),
          getSwapRequests(),
          getAcceptedSwaps()
        ]);

        // 1. Pending Challenges
        const challenges = (challengeRes.data.data || [])
          .filter((c: any) => c.status === 'pending' && c.challenged_id === user?.id)
          .map((c: any) => ({
            ...c,
            type: 'challenge',
            display_name: c.challenger_name,
            display_book: c.book_title,
            created_at: c.created_at
          }));

        // 2. Incoming Book Requests (Pending)
        const bookRequests = (swapRes.data.data.received || [])
          .filter((s: any) => s.status === 'pending')
          .map((s: any) => ({
            ...s,
            type: 'book_request',
            display_name: s.sender_name,
            display_book: s.target_book_title,
            created_at: s.created_at
          }));

        // 3. Accepted Swaps 
        const swapResponses = (acceptedRes.data.data || []).map((s: any) => ({
          ...s,
          type: 'swap_response',
          display_name: s.owner_name,
          display_book: s.target_book_title,
          created_at: s.created_at
        }));

        const all = [...challenges, ...bookRequests, ...swapResponses].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setNotifications(all);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNotifications();

    const socket = io(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000", {
      withCredentials: true
    });

    socket.on('receive_book_request', (data) => {
      const newNotif = {
        ...data,
        type: 'book_request',
        display_name: data.senderName,
        display_book: data.bookTitle,
        created_at: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    });

    socket.on('receive_swap_update', (data) => {
      if (data.status === 'accepted') {
        const newResponse = {
          type: 'swap_response',
          display_name: data.senderName,
          display_book: data.bookTitle,
          status: data.status,
          created_at: new Date().toISOString()
        };
        setNotifications(prev => [newResponse, ...prev]);
      }
    });

    return () => { socket.disconnect(); };
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 font-main">
      <UserNav />
      <main className="max-w-3xl mx-auto pt-28 pb-12 px-6">
        <h1 className="text-3xl font-black mb-10 flex items-center gap-4 italic text-gray-900 tracking-tight">
          <div className="bg-[#14919B] p-2 rounded-xl">
            <Bell className="text-white" size={24} />
          </div>
          Notifications
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#14919B]" size={40} />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((item, idx) => (
              <Link
                href={item.type === 'challenge' ? "/user/challenges" : "/user/events"}
                key={idx}
                className="block bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-[#14919B]/40 hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300 ${
                      item.type === 'challenge' ? 'bg-amber-50 text-amber-600' : 
                      item.type === 'swap_response' ? 'bg-green-50 text-green-600' : 
                      'bg-[#14919B]/10 text-[#14919B]'
                    }`}>
                      {item.type === 'challenge' && <Sword size={22} />}
                      {item.type === 'book_request' && <MessageSquare size={22} />}
                      {item.type === 'swap_response' && <CheckCircle2 size={22} />}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg leading-tight italic">
                        {item.type === 'challenge' && `${item.display_name} challenged you!`}
                        {item.type === 'book_request' && `${item.display_name} wants to swap books!`}
                        {item.type === 'swap_response' && `${item.display_name} accepted your swap!`}
                      </p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] mt-1">
                        {item.type === 'swap_response' ? `Confirmed: ${item.display_book}` : `Book: ${item.display_book}`}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-200 group-hover:text-[#14919B] group-hover:translate-x-1 transition-all" size={24} />
                </div>
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-[#14919B]/5 transition-colors" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <Bell size={48} className="mx-auto text-gray-100 mb-4" />
            <p className="text-gray-400 font-black text-xl italic">Silence is golden...</p>
            <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest mt-2">No new updates right now</p>
          </div>
        )}
      </main>
    </div>
  );
}