'use client';

import { useEffect, useState } from "react";
import UserNav from "@/components/Navbar/UserNav";
import { getPendingFriendRequests, acceptFriendRequest, deleteFriendRequest } from "@/lib/user";
import Image from "next/image";
import { Check, X, User } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

interface PendingUser {
  id: number;
  name: string;
  email: string;
  picture_url?: string;
}

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  // 1. Fetch requests on mount
  useEffect(() => {
    const loadRequests = async () => {
      if (!user) return;
      try {
        const data = await getPendingFriendRequests(Number(user.id));
        // Adjusted to match your specific data structure
        setRequests(data.data.pendingRequests);
      } catch (error) {
        console.error("Failed to load requests:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [user]); // Added user to dependency array for safety

  // 2. Handle Actions (Accept/Reject)
  const handleAction = async (id: number, type: 'accept' | 'reject') => {
    try {
      if (type === 'accept') {
        await acceptFriendRequest(id);
      } else {
        await deleteFriendRequest(id);
      }
      // Remove the user from the local state so the UI updates instantly
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      alert(`Failed to ${type} request. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-main">
      <UserNav />
      
      <main className="max-w-6xl mx-auto pt-24 pb-12 px-6">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Friend Requests</h1>
          <p className="text-gray-500 mt-2">Manage people who want to connect with you.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 w-full bg-gray-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div 
                key={request.id} 
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all hover:shadow-md"
              >
                {/* Profile Image Card Section */}
                <div className="relative h-24 w-24 mb-4">
                  <div className="h-full w-full rounded-full bg-gray-100 overflow-hidden relative border-4 border-gray-50">
                    {request.picture_url ? (
                      <Image 
                        src={request.picture_url} 
                        alt={request.name} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#14919B]">
                        <User size={40} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">{request.name}</h3>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">{request.email}</p>
                </div>

                {/* Card Action Buttons */}
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => handleAction(request.id, 'reject')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X size={18} />
                    Decline
                  </button>
                  <button
                    onClick={() => handleAction(request.id, 'accept')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#14919B] text-white rounded-xl font-medium hover:bg-[#0f7178] shadow-sm transition-all"
                  >
                    <Check size={18} />
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No pending requests</h3>
            <p className="text-gray-500 mt-2">When someone sends you an invite, it will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
}