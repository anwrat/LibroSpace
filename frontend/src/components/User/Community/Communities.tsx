'use client';

import { useState, useEffect } from "react";
import { getAllCommunities } from "@/lib/user";
import Image from "next/image";
import { Users, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ExploreCommunities() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await getAllCommunities();
        setCommunities(res.data || []);
      } catch (err) {
        console.error("Error loading communities: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunities();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 w-full">
        <Loader2 className="animate-spin text-[#14919B] mb-4" size={40} />
        <p className="text-gray-500 animate-pulse">Finding communities for you...</p>
      </div>
    );
  }

  return (
    <>
      {communities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communities.map((community) => (
            <div 
              key={community.id} 
              className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image and Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-gray-50 shadow-inner">
                  {community.photo_url ? (
                    <Image 
                      src={community.photo_url} 
                      alt={community.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center text-[#14919B]">
                      <Users size={32} />
                    </div>
                  )}
                </div>
                
                <Link 
                  href={`/community/${community.id}`}
                  className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-[#14919B] hover:text-white transition-colors"
                >
                  <ArrowUpRight size={20} />
                </Link>
              </div>

              {/* Text Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#14919B] transition-colors truncate">
                  {community.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#14919B] bg-[#14919B]/10 px-2 py-0.5 rounded-full">
                    <Users size={12} />
                    {community.member_count || 0} members
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    Public
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-4 line-clamp-2 leading-relaxed">
                  {community.description || "No description provided for this community."}
                </p>
              </div>

              {/* Action Button */}
              <button className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-[#14919B] transition-all shadow-md active:scale-95">
                Join Community
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Users size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No communities yet</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">
            Be the first to create a community and start a conversation!
          </p>
        </div>
      )}
    </>
  );
}