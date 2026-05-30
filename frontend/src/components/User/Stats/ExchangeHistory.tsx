"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Loader2,
  ArrowRightLeft,
  BookOpen,
  User,
  Calendar,
} from "lucide-react";
import { getCompletedSwaps } from "@/lib/user";
import { useAuthContext } from "@/context/AuthContext";

interface CompletedSwap {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: string;
  created_at: string;
  receiver_book_id: number;
  receiver_book_title: string;
  receiver_book_image: string | null;
  sender_book_id: number;
  sender_book_title: string;
  sender_book_image: string | null;
  partner_name: string;
  partner_id: number;
}

export default function ExchangeHistory() {
  const [swaps, setSwaps] = useState<CompletedSwap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        setLoading(true);
        const response = await getCompletedSwaps();
        setSwaps(response?.data?.data || []);
      } catch (err) {
        console.error("Failed to load completed exchanges:", err);
        setError("Could not retrieve exchange history.");
      } finally {
        setLoading(false);
      }
    };

    fetchExchanges();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="animate-spin text-[#14919B] mb-3" size={32} />
        <p className="text-sm font-medium">
          Retrieving completed book swaps...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-[2.5rem] border border-red-100 max-w-2xl mx-auto font-medium text-sm">
        {error}
      </div>
    );
  }

  if (swaps.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 p-8 max-w-2xl mx-auto">
        <ArrowRightLeft
          size={48}
          className="mx-auto text-gray-300 mb-4 stroke-[1.5]"
        />
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          No completed swaps yet
        </h3>
        <p className="text-gray-500 text-sm">
          Your accepted and completed trades with other community readers will
          show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 px-2">
        <h2 className="text-2xl font-black text-gray-900">Book Exchanges</h2>
        <p className="text-gray-500 text-sm">
          A historical record of your book exchanges.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {swaps.map((swap) => {
          const isUserSender = Number(user?.id) === swap.sender_id;
          const userBookTitle = isUserSender
            ? swap.sender_book_title
            : swap.receiver_book_title;
          const userBookImage = isUserSender
            ? swap.sender_book_image
            : swap.receiver_book_image;
          const partnerBookTitle = isUserSender
            ? swap.receiver_book_title
            : swap.sender_book_title;
          const partnerBookImage = isUserSender
            ? swap.receiver_book_image
            : swap.sender_book_image;

          return (
            <div
              key={swap.id}
              className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 bg-gray-50/80 border border-gray-100 px-5 py-3 rounded-2xl w-full lg:w-auto">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <User size={12} />
                    <span>Exchange Partner</span>
                  </div>
                  <p className="text-base font-black text-gray-900">
                    {swap.partner_name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1 font-medium">
                    <Calendar size={12} />
                    <span>
                      {new Date(swap.created_at).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 w-full">
                <div className="flex items-center gap-4 w-full sm:w-1/2 justify-end">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                      Your Book
                    </span>
                    <p className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 max-w-[200px]">
                      {userBookTitle || "Unknown Asset Listing"}
                    </p>
                  </div>
                  <div className="relative h-24 w-16 bg-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-sm shrink-0 flex items-center justify-center text-gray-400">
                    {userBookImage ? (
                      <Image
                        src={userBookImage}
                        alt={userBookTitle || "Book Cover"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <BookOpen size={20} />
                    )}
                  </div>
                </div>

                <div className="h-10 w-10 rounded-full bg-[#14919B]/10 text-[#14919B] flex items-center justify-center shrink-0 border border-[#14919B]/20 shadow-sm animate-pulse">
                  <ArrowRightLeft size={16} strokeWidth={2.5} />
                </div>

                <div className="flex items-center gap-4 w-full sm:w-1/2 justify-start">
                  <div className="relative h-24 w-16 bg-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-sm shrink-0 flex items-center justify-center text-gray-400">
                    {partnerBookImage ? (
                      <Image
                        src={partnerBookImage}
                        alt={partnerBookTitle || "Book Cover"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <BookOpen size={20} />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-[#14919B] uppercase tracking-widest block mb-1">
                      Received
                    </span>
                    <p className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 max-w-[200px]">
                      {partnerBookTitle || "Unknown Asset Listing"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
