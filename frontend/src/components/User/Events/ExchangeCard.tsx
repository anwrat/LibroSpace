'use client';

import { useState } from "react";
import { MapPin, User, MessageCircle, Loader2, Clock, Check } from "lucide-react";
import Image from "next/image";

interface ExchangeCardProps {
  data: any;
  onRequest: (id: number) => Promise<void>;
  isAlreadyRequested?: boolean;
}

export default function ExchangeCard({ data, onRequest, isAlreadyRequested }: ExchangeCardProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequest = async () => {
    if (isAlreadyRequested) return;
    setIsRequesting(true);
    await onRequest(data.id);
    setIsRequesting(false);
  };

  return (
    <div className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-xl hover:shadow-[#14919B]/5 transition-all duration-500 flex flex-col h-full">
      <div className="relative h-52 w-full bg-gray-50 overflow-hidden">
        {data.image_url ? (
          <Image 
            src={data.image_url} 
            alt={data.book_title} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-4xl">
            {data.book_title[0]}
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-[#14919B] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            {data.condition}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-black text-gray-900 text-lg leading-tight mb-1 truncate italic">
          {data.book_title}
        </h3>
        <p className="text-sm text-gray-500 font-bold mb-3">{data.book_author}</p>

        {data.description && (
          <p className="text-xs text-gray-400 font-medium line-clamp-2 mb-4 italic leading-relaxed">
            "{data.description}"
          </p>
        )}

        <div className="flex items-center gap-2 text-gray-400 mb-6 mt-auto">
          <MapPin size={14} className="text-[#14919B]" />
          <span className="text-xs font-bold">{data.location_city}</span>
        </div>

        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              {data.owner_picture ? (
                <Image src={data.owner_picture} alt="" width={32} height={32} />
              ) : <User size={16} className="text-gray-400" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">
                {data.owner_name?.split(' ')[0]}
              </span>
              <span className="text-[8px] font-bold text-gray-400 uppercase">Owner</span>
            </div>
          </div>
          
          <button 
            disabled={isRequesting || isAlreadyRequested}
            onClick={handleRequest}
            className={`group/btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md ${
              isAlreadyRequested 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-[#14919B] text-white hover:scale-105 active:scale-95 shadow-[#14919B]/20'
            }`}
          >
            {isRequesting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isAlreadyRequested ? (
              <>
                <span>Requested</span>
                <Clock size={14} />
              </>
            ) : (
              <>
                <span>Request</span>
                <MessageCircle size={14} className="group-hover/btn:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}