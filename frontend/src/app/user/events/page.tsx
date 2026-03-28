'use client';

import { useState, useEffect } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { Sparkles, ArrowRight, Inbox, Send, LayoutGrid, Check, MessageCircle, Clock } from "lucide-react";
import ExchangeCard from "@/components/User/Events/ExchangeCard";
import JoinExchangeModal from "@/components/User/Events/JoinExchangeModal";
import { getAllExchanges, getJoinStatus, requestSwap, getSwapRequests } from "@/lib/user";
import { toast } from "react-hot-toast"; 
import Image from "next/image";

export default function EventsPage() {
  const [hasJoined, setHasJoined] = useState<boolean | null>(null);
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [activeTab, setActiveTab] = useState<'browse' | 'requests'>('browse');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusRes = await getJoinStatus();
      setHasJoined(statusRes.data.joined);

      if (statusRes.data.joined) {
        const [listingsRes, requestsRes] = await Promise.all([
          getAllExchanges(),
          getSwapRequests()
        ]);
        setListings(listingsRes.data.data || []);
        setRequests(requestsRes.data.data || { sent: [], received: [] });
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestSwap = async (listingId: number) => {
    try {
      const res = await requestSwap(listingId);
      if (res.data.success) {
        toast.success("Request sent!");
        // Refresh requests to update button states
        const reqRes = await getSwapRequests();
        setRequests(reqRes.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  // const handleAccept = async (requestId: number) => {
  //   try {
  //     const res = await acceptRequest(requestId);
  //     if (res.data.success) {
  //       toast.success("Accepted! Conversation started.");
  //       fetchData(); // Refresh to show 'Accepted' status
  //     }
  //   } catch (err) {
  //     toast.error("Failed to accept request");
  //   }
  // };

  // Helper to check if a listing is already requested by current user
  const sentRequestListingIds = new Set(requests.sent.map((r: any) => r.listing_id));

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-[#14919B] animate-pulse">Loading LibroSpace...</div>;

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 font-main bg-[#fafafa]">
      <UserNav />
      <div className="max-w-7xl mx-auto">
        
        {!hasJoined ? (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="inline-flex items-center gap-2 bg-[#14919B]/10 text-[#14919B] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <Sparkles size={14} /> Seasonal Event
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight italic">
              The Great <span className="text-[#14919B]">Book Exchange</span>
            </h1>
            <p className="text-xl text-gray-500 mb-12 leading-relaxed font-medium">
              Join our community event to swap books with readers nearby.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group bg-[#14919B] text-white px-10 py-6 rounded-[2rem] font-black text-lg hover:scale-105 transition-all flex items-center gap-4 mx-auto shadow-xl shadow-[#14919B]/20"
            >
              List a Book to Enter <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Community Bookshelf</h1>
                <p className="text-gray-500 font-bold">Swap your stories with the world.</p>
              </div>

              <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem]">
                <button 
                  onClick={() => setActiveTab('browse')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'browse' ? 'bg-white text-[#14919B] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <LayoutGrid size={16} /> Browse
                </button>
                <button 
                  onClick={() => setActiveTab('requests')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-white text-[#14919B] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Inbox size={16} /> Requests
                </button>
              </div>
            </header>

            {activeTab === 'browse' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {listings.map((listing: any) => (
                  <ExchangeCard 
                    key={listing.id} 
                    data={listing} 
                    onRequest={handleRequestSwap}
                    isAlreadyRequested={sentRequestListingIds.has(listing.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                <RequestListSection 
                  title="Received Requests" 
                  type="received" 
                  data={requests.received} 
                  // onAccept={handleAccept}
                />
                <RequestListSection 
                  title="Sent Requests" 
                  type="sent" 
                  data={requests.sent} 
                />
              </div>
            )}
          </div>
        )}
      </div>

      <JoinExchangeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
      />
    </main>
  );
}

function RequestListSection({ title, type, data, onAccept }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2 italic">
          {type === 'sent' ? <Send size={18} className="text-[#14919B]" /> : <Inbox size={18} className="text-[#14919B]" />}
          {title}
        </h3>
        <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black">{data.length} TOTAL</span>
      </div>

      <div className="space-y-4">
        {data.length > 0 ? data.map((item: any) => (
          <div key={item.id} className="group bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 p-4 rounded-3xl transition-all flex items-center gap-4">
            <div className="relative w-16 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
              {item.image_url ? (
                <Image src={item.image_url} alt={item.book_title} fill className="object-cover" />
              ) : <div className="w-full h-full flex items-center justify-center font-black text-gray-400 text-xl">{item.book_title[0]}</div>}
            </div>
            
            <div className="flex-1">
              <h4 className="font-black text-sm text-gray-900 line-clamp-1">{item.book_title}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                {type === 'received' ? `From: ${item.sender_name}` : `Owner: ${item.owner_name}`}
              </p>
              
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                  item.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {type === 'received' && item.status === 'pending' && (
                <button 
                  onClick={() => onAccept(item.id)}
                  className="p-3 bg-[#14919B] text-white rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#14919B]/20"
                >
                  <Check size={18} />
                </button>
              )}
              {item.status === 'accepted' && (
                <button className="p-3 bg-white text-[#14919B] border border-gray-100 rounded-2xl hover:scale-105 transition-all shadow-sm">
                  <MessageCircle size={18} />
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 italic font-bold text-gray-400">
            {type === 'sent' ? <Send size={40} className="mb-2"/> : <Inbox size={40} className="mb-2"/>}
            No {type} requests.
          </div>
        )}
      </div>
    </div>
  );
}