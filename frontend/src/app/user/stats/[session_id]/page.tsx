'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessionDetails } from "@/lib/user"; 
import UserNav from "@/components/Navbar/UserNav";
import ReadingEditor from "@/components/Editor/ReadingEditor";
import { ArrowLeft, Clock, BookOpen, Calendar, Quote } from "lucide-react";

export default function SessionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetails() {
            try {
                const res = await getSessionDetails(Number(params.session_id));
                setSession(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        if (params.session_id) fetchDetails();
    }, [params.session_id]);

    if (loading) return <div className="pt-32 text-center">Loading session...</div>;
    if (!session) return <div className="pt-32 text-center">Session not found.</div>;

    const durationMins = Math.floor(session.duration_seconds / 60);

    return (
        <main className="min-h-scree pt-24 pb-20 px-6 font-main mx-auto max-w-7xl">
            <UserNav />
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#14919B] mb-8 font-bold transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Stats
                </button>

                {/* Header Section */}
                <header className="mb-10">
                    <div className="flex items-center gap-3 text-[#14919B] mb-2">
                        <Calendar size={18} />
                        <span className="font-bold uppercase tracking-widest text-sm">
                            {new Date(session.end_time).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 leading-tight">
                        Notes on <span className="text-[#14919B]">{session.book_title}</span>
                    </h1>
                </header>

                {/* Stats Summary Grid */}
                <div className="grid grid-cols-2 gap-4 mb-12">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Duration</p>
                            <p className="text-xl font-black text-gray-900">{durationMins}m {session.duration_seconds % 60}s</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Pages Read</p>
                            <p className="text-xl font-black text-gray-900">{session.start_page} — {session.end_page}</p>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Quote className="text-[#14919B]" fill="#14919B" size={20} />
                        <h2 className="text-2xl font-black text-gray-900">Session Notes</h2>
                    </div>
                    
                    {session.notes ? (
                        <ReadingEditor 
                            content={session.notes} 
                            editable={false} 
                        />
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center">
                            <p className="text-gray-400 italic">No notes were taken during this session.</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}