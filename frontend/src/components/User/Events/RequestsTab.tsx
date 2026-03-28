import { Inbox, Send, Check, X, MessageCircle, Repeat } from "lucide-react";
import { respondToSwap } from "@/lib/user";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { useAuthContext } from "@/context/AuthContext";
import Image from "next/image";

export default function RequestsTab({ requests, refresh }: any) {
  const { user: currentUser } = useAuthContext();

  const handleResponse = async (requestId: number, status: 'accepted' | 'rejected') => {
    try {
      const res = await respondToSwap(requestId, status);
      if (res.data.success) {
        toast.success(`Trade ${status}!`);
        const item = requests.received.find((r:any) => r.id === requestId);
        const socket = io(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000", { withCredentials: true });
        socket.emit('swap_response', {
          receiverId: item?.sender_id,
          senderName: currentUser?.name,
          bookTitle: item?.target_book_title,
          status
        });
        refresh();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <Section title="Incoming" data={requests.received} type="received" onResponse={handleResponse} />
      <Section title="Sent" data={requests.sent} type="sent" />
    </div>
  );
}

function Section({ title, data, type, onResponse }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
      <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm mb-8 italic flex items-center gap-2">
        {type === 'sent' ? <Send size={16}/> : <Inbox size={16}/>} {title} Proposals
      </h3>
      <div className="space-y-4">
        {data.length > 0 ? data.map((item: any) => (
          <div key={item.id} className="p-6 bg-gray-50/50 rounded-[2rem] border border-transparent hover:border-gray-100 transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <BookThumb url={item.sender_book_image} label="Offer" />
                  <Repeat className="text-[#14919B]" size={16} />
                  <BookThumb url={item.target_book_image} label="Request" />
               </div>
               {type === 'received' && item.status === 'pending' && (
                 <div className="flex gap-2">
                    <button onClick={() => onResponse(item.id, 'accepted')} className="p-2 bg-[#14919B] text-white rounded-lg"><Check size={16}/></button>
                    <button onClick={() => onResponse(item.id, 'rejected')} className="p-2 bg-red-50 text-red-500 rounded-lg"><X size={16}/></button>
                 </div>
               )}
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400">
               <span>{type === 'received' ? item.sender_name : item.owner_name}</span>
               <span className={item.status === 'accepted' ? 'text-green-500' : ''}>{item.status}</span>
            </div>
          </div>
        )) : <p className="text-center py-10 text-gray-300 font-black italic uppercase text-xs">Empty</p>}
      </div>
    </div>
  );
}

function BookThumb({ url, label }: any) {
  return (
    <div className="text-center">
      <div className="relative w-12 h-16 bg-gray-200 rounded-lg overflow-hidden border-2 border-white shadow-sm">
        {url && <Image src={url} alt="book" fill className="object-cover" />}
      </div>
      <p className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-tighter">{label}</p>
    </div>
  );
}