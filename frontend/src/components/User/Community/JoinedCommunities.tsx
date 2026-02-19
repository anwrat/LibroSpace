'use client';
import { useState, useEffect } from "react";
import { getJoinedCommunities } from "@/lib/user";
import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";

export default function JoinedCommunities() {
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  useEffect(()=>{
    async function fetchJoinedCommunities(){
      try{
        const res = await getJoinedCommunities();
        setCommunities(res.data || []);
      }catch(err){
        console.error("Error loading joined communities: ",err);
      }finally{
        setLoading(false);
      }
    }
    fetchJoinedCommunities();
  },[]);
  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-3xl" />)}
  </div>;

  return communities.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {communities.map((community:any) => (
        <Link href={`/user/community/${community.id}`} key={community.id} className="group bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden relative border border-gray-50">
              <Image src={community.photo_url} alt={community.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 group-hover:text-[#14919B] transition-colors">{community.name}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Users size={12} /> {community.member_count} members
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 line-clamp-2">{community.description}</p>
        </Link>
      ))}
    </div>
  ) : (
    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
      <p className="text-gray-500">You haven't joined any communities yet.</p>
    </div>
  );
}