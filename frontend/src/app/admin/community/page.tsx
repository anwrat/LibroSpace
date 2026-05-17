'use client';

import { useEffect, useState } from "react";
import AdminNav from "@/components/Navbar/AdminNav";
import { getAllCommunities } from "@/lib/admin";
import { 
  Users, 
  Search, 
  ExternalLink, 
  Trash2, 
  ShieldCheck, 
  Loader2, 
  Filter,
  MoreVertical,
  Globe
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminCommunitiesPage() {
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchDocs() {
            try {
                const res = await getAllCommunities();
                setCommunities(res.data.data || []);
            } catch (err) {
                console.error("Failed to load communities", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDocs();
    }, []);

    const filteredCommunities = communities.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar Navigation */}
            <AdminNav />
            
            {/* Main Content Area */}
            <main className="flex-1 ml-64 transition-all duration-300 p-8">
                
                {/* --- TOP BAR / HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight font-main">
                            Communities
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">
                            Review, moderate, and manage all LibroSpace groups.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#14919B] transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-[#14919B]/10 focus:border-[#14919B] outline-none w-80 shadow-sm transition-all font-medium"
                            />
                        </div>
                        <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* --- TABLE CARD --- */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                                <Loader2 className="animate-spin text-[#14919B]" size={48} />
                                <div className="absolute inset-0 m-auto w-2 h-2 bg-[#14919B] rounded-full"></div>
                            </div>
                            <p className="text-gray-400 font-bold text-lg animate-pulse tracking-tight">Syncing Communities...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Community Info</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Analytics</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Created At</th>
                                        <th className="px-8 py-5 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredCommunities.map((community) => (
                                        <tr key={community.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gray-100 overflow-hidden relative shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                                        <Image 
                                                            src={community.image_url || '/Placeholders/community-placeholder.png'} 
                                                            alt="" fill className="object-cover" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-[#14919B] transition-colors">{community.name}</p>
                                                        <p className="text-xs text-gray-400 font-medium line-clamp-1 max-w-60">{community.description || "No description provided."}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                                                        <Users size={14} className="text-[#14919B]" />
                                                        {community.member_count || 0}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Total Members</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold text-gray-500">
                                                {new Date(community.created_at).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link 
                                                        href={`/user/community/${community.id}`}
                                                        className="p-2.5 text-gray-400 hover:text-[#14919B] hover:bg-[#14919B]/10 rounded-xl transition-all"
                                                        title="View Community"
                                                    >
                                                        <ExternalLink size={20} />
                                                    </Link>
                                                    <button 
                                                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Moderate / Delete"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {filteredCommunities.length === 0 && (
                                <div className="p-32 text-center flex flex-col items-center">
                                    <div className="h-24 w-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                                        <Search size={40} className="text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 italic">No Groups Found</h3>
                                    <p className="text-gray-400 font-medium mt-2">Try adjusting your search filters.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}