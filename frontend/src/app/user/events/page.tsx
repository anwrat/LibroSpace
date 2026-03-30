'use client';

import { useState, useEffect, useCallback } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { LayoutGrid, Inbox, BookOpen, Loader2 } from "lucide-react";
import { getJoinStatus, getAllExchanges, getSwapRequests } from "@/lib/user";
import { useAuthContext } from "@/context/AuthContext";
import HeroSection from "@/components/User/Events/HeroSection";
import BrowseTab from "@/components/User/Events/BrowseTab";
import RequestsTab from "@/components/User/Events/RequestsTab";
import MyBooksTab from "@/components/User/Events/MyBooksTab";
import JoinExchangeModal from "@/components/User/Events/JoinExchangeModal";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'requests' | 'my-books'>('browse');
  const [hasJoined, setHasJoined] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Data State
  const [listings, setListings] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<{ sent: any[]; received: any[] }>({ sent: [], received: [] });
  
  const { user: currentUser } = useAuthContext();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const statusRes = await getJoinStatus();
      const joined = statusRes.data.joined;
      setHasJoined(joined);

      if (joined) {
        const [listingsRes, requestsRes] = await Promise.all([
          getAllExchanges(),
          getSwapRequests()
        ]);
        
        const allListings = listingsRes.data.data || [];
        setListings(allListings.filter((l: any) => l.user_id !== currentUser?.id));
        setMyListings(allListings.filter((l: any) => l.user_id === currentUser?.id));
        setRequests(requestsRes.data.data || { sent: [], received: [] });
      }
    } catch (err) {
      console.error("Error fetching event data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingScreen />;

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 font-main bg-[#fafafa]">
      <UserNav />
      <div className="max-w-7xl mx-auto">
        {!hasJoined ? (
          <HeroSection onJoin={() => setIsModalOpen(true)} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Book Exchange</h1>
                <p className="text-gray-500 font-bold">Swap your stories with the world.</p>
              </div>

              <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem] shadow-inner">
                <TabButton active={activeTab === 'browse'} onClick={() => setActiveTab('browse')} icon={<LayoutGrid size={16}/>} label="Browse" />
                <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} icon={<Inbox size={16}/>} label="Requests" />
                <TabButton active={activeTab === 'my-books'} onClick={() => setActiveTab('my-books')} icon={<BookOpen size={16}/>} label="My Listings" />
              </div>
            </header>

            {activeTab === 'browse' && <BrowseTab listings={listings} requests={requests} refresh={fetchData} />}
            {activeTab === 'requests' && <RequestsTab requests={requests} refresh={fetchData} />}
            {activeTab === 'my-books' && <MyBooksTab myListings={myListings} setMyListings={setMyListings} />}
          </div>
        )}
      </div>

      <JoinExchangeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
    </main>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-[#14919B] shadow-sm scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}>
      {icon} {label}
    </button>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#14919B] mb-4" size={40} />
      <p className="font-black text-[#14919B] italic animate-pulse">Organizing Bookshelf...</p>
    </div>
  );
}