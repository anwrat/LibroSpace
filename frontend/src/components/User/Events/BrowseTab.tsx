import ExchangeCard from "@/components/User/Events/ExchangeCard";
import { Sparkles } from "lucide-react";
import { requestSwap } from "@/lib/user";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { useAuthContext } from "@/context/AuthContext";

export default function BrowseTab({ listings, requests, refresh }: any) {
  const { user: currentUser } = useAuthContext();
  const sentRequestListingIds = new Set(requests.sent.map((r: any) => r.listing_id));

  const handleRequestSwap = async (listing: any) => {
    try {
      const res = await requestSwap(listing.id);
      if (res.data.success) {
        toast.success("Request sent!");
        const socket = io(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000", { withCredentials: true });
        socket.emit('send_book_request', { 
            receiverId: listing.user_id, 
            senderName: currentUser?.name, 
            bookTitle: listing.book_title 
        });
        refresh();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  if (listings.length === 0) return (
    <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
       <Sparkles size={48} className="mx-auto text-gray-100 mb-4" />
       <p className="text-gray-400 font-black text-xl italic">No books available for swap yet.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {listings.map((listing: any) => (
        <ExchangeCard 
          key={listing.id} 
          data={listing} 
          onRequest={() => handleRequestSwap(listing)}
          isAlreadyRequested={sentRequestListingIds.has(listing.id)}
        />
      ))}
    </div>
  );
}