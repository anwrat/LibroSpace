'use client';

import { useEffect, useState } from "react";
import { getUserBadges } from "@/lib/user"; 
import { Loader2, Award, Calendar} from "lucide-react";
import Image from "next/image";

interface Badge {
  name: string;
  description: string;
  icon_url: string;
  earned_at: string;
}

export default function UserBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await getUserBadges();
        setBadges(res.data.data || []);
      } catch (err) {
        console.error("Error fetching badges:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-gray-100">
        <Loader2 className="animate-spin text-[#14919B] mb-4" size={32} />
        <p className="text-gray-500 font-medium">Polishing your trophies...</p>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-[2.5rem] border border-gray-100">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="text-gray-300" size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No badges yet</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-2">
          Complete daily goals and win challenges to start filling your showcase!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {badges.map((badge, index) => (
        <div 
          key={index}
          className="group bg-white border border-gray-100 p-6 rounded-[2.5rem] hover:shadow-xl hover:shadow-[#14919B]/5 transition-all duration-300 relative overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#14919B]/5 rounded-full blur-3xl group-hover:bg-[#14919B]/10 transition-colors" />

          <div className="flex items-start gap-5">
            {/* Badge Icon */}
            <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Image 
                src={badge.icon_url} 
                alt={badge.name} 
                width={60} 
                height={60} 
                className="object-contain drop-shadow-md"
              />
            </div>

            {/* Badge Info */}
            <div className="flex-1">
              <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">
                {badge.name}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                {badge.description}
              </p>
              
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#14919B] bg-[#14919B]/5 w-fit px-3 py-1.5 rounded-full">
                <Calendar size={12} />
                EARNED {new Date(badge.earned_at).toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}