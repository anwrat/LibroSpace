'use client';

import { useState } from "react";
import { BookOpen, CheckCircle2, Loader2, User, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import { completeSwap, getAcceptedSwaps } from "@/lib/user";

export default function MyBooksTab({ myListings, setMyListings }: any) {
  if (!myListings || myListings.length === 0) return (
    <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
       <BookOpen size={48} className="mx-auto text-gray-100 mb-4" />
       <p className="text-gray-400 font-black text-xl italic">You haven't listed anything.</p>
       <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest mt-2">Your shelf is currently empty</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {myListings.map((listing: any) => (
        <MyListingCard 
          key={listing.id} 
          data={listing} 
          onUpdate={(id: number) => {
            // Remove the book from the UI once swapped
            setMyListings(myListings.filter((l: any) => l.id !== id));
          }}
        />
      ))}
    </div>
  );
}

function MyListingCard({ data, onUpdate }: { data: any, onUpdate: (id: number) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptedRequests, setAcceptedRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users who have an "accepted" status for this specific book
  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setLoadingRequests(true);
    try {
      const res = await getAcceptedSwaps();
      setAcceptedRequests(res.data.data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleFinalizeSwap = async (requestId: number) => {
    setIsSubmitting(true);
    try {
      await completeSwap(Number(requestId));
      setIsModalOpen(false);
      onUpdate(data.id); 
    } catch (err) {
      console.error("Swap completion failed:", err);
      alert("Could not finalize swap. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="group bg-white rounded-[2.5rem] p-5 border border-gray-100 hover:shadow-xl transition-all duration-500 flex flex-col h-full">
        {/* Book Cover */}
        <div className="relative aspect-3/4 rounded-[2rem] overflow-hidden mb-6 shadow-md shrink-0">
          {data.image_url ? (
            <Image 
              src={data.image_url} 
              alt={data.book_title} 
              fill 
              className="object-cover group-hover:scale-110 transition-transform duration-700" 
            />
          ) : (
            <div className="w-full h-full bg-[#14919B]/5 flex items-center justify-center font-black text-[#14919B]/20 text-4xl italic">
              {data.book_title[0]}
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-[#14919B] border border-[#14919B]/10">
            YOUR LISTING
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-2">
          <h3 className="font-black text-gray-900 text-lg line-clamp-1 italic">{data.book_title}</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{data.location_city}</p>
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleOpenModal}
          className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-black italic text-xs tracking-tight bg-[#14919B]/10 text-[#14919B] hover:bg-[#14919B] hover:text-white transition-all active:scale-95"
        >
          <CheckCircle2 size={16} />
          MARK AS SWAPPED
        </button>
      </div>

      {/* --- SELECT PARTNER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => !isSubmitting && setIsModalOpen(false)} 
          />
          
          {/* Modal Card */}
          <div className="relative bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300 border border-gray-100">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-black italic text-gray-900 mb-2">Finalize Swap</h2>
              <p className="text-gray-500 text-sm font-medium">
                Select the person you swapped <span className="text-[#14919B]">"{data.book_title}"</span> with to complete the record.
              </p>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {loadingRequests ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="animate-spin text-[#14919B]" size={32} />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Finding accepted partners...</p>
                </div>
              ) : acceptedRequests.length > 0 ? (
                acceptedRequests.map((req) => (
                  <button
                    key={req.id}
                    disabled={isSubmitting}
                    onClick={() => handleFinalizeSwap(req.id)}
                    className="w-full flex items-center justify-between p-5 rounded-3xl border-2 border-gray-50 hover:border-[#14919B] hover:bg-[#14919B]/5 transition-all group text-left relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-[#14919B]/10 flex items-center justify-center text-[#14919B] group-hover:bg-[#14919B] group-hover:text-white transition-colors">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg italic leading-tight">{req.partner_name}</p>
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.15em] mt-1">Confirmed Partner</p>
                      </div>
                    </div>
                    
                    {isSubmitting ? (
                      <Loader2 className="animate-spin text-[#14919B] shrink-0" size={20} />
                    ) : (
                      <ArrowRight className="text-gray-200 group-hover:text-[#14919B] group-hover:translate-x-1 transition-all shrink-0" size={20} />
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <User size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 italic font-black text-sm px-6">No accepted requests found for this listing yet.</p>
                </div>
              )}
            </div>

            <p className="mt-8 text-[9px] text-center text-gray-300 font-black uppercase tracking-[0.2em]">
              This action will mark the listing as swapped
            </p>
          </div>
        </div>
      )}
    </>
  );
}