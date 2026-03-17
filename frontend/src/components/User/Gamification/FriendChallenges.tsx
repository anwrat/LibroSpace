'use client';

import { useState, useEffect } from 'react';
import { respondToChallenge, getUserFriendChallenges } from '@/lib/user';
import { useAuthContext } from "@/context/AuthContext";
import { Sword, Check, X, Trophy, User } from 'lucide-react';
import Image from 'next/image';

export default function FriendChallenges() {
  const { user } = useAuthContext();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    try {
      const res = await getUserFriendChallenges();
      setChallenges(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching friend challenges", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    try {
      await respondToChallenge(id, action);
      fetchChallenges(); // Refresh list to move challenge to active or remove it
    } catch (err) {
      console.error("Action failed", err);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-100 rounded-3xl" />
      </div>
    );
  }

  // Filter pending challenges where the CURRENT user is the one being challenged
  const incomingPending = challenges.filter(
    (c) => c.status === 'pending' && Number(c.challenged_id) === Number(user?.id)
  );

  // Filter active challenges where the user is either the challenger or challenged
  const active = challenges.filter((c) => c.status === 'active');

  return (
    <div className="space-y-8">
      {/* Pending Invites Section */}
      {incomingPending.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sword size={20} className="text-[#14919B]" /> Pending Invites
          </h3>
          {incomingPending.map((challenge) => (
            <div 
              key={challenge.id} 
              className="bg-white p-4 rounded-3xl border border-[#14919B]/20 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative">
                  {challenge.challenger_picture ? (
                    <Image 
                      src={challenge.challenger_picture} 
                      fill 
                      alt="challenger" 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#14919B]">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold">{challenge.challenger_name} challenged you!</p>
                  <p className="text-xs text-gray-500">Goal: {challenge.goal_value} mins</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAction(challenge.id, 'accept')} 
                  className="p-2 bg-[#14919B] text-white rounded-full hover:bg-[#0e6b73] transition-colors"
                  title="Accept Challenge"
                >
                  <Check size={16} />
                </button>
                <button 
                  onClick={() => handleAction(challenge.id, 'reject')} 
                  className="p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Decline Challenge"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active "Versus" Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Trophy size={20} className="text-orange-500" /> Active Duels
        </h3>
        {active.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((challenge) => (
              <div key={challenge.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                   <div className="text-center">
                     <div className="relative w-10 h-10 mx-auto mb-1">
                      {challenge.challenger_picture ? (
                        <Image 
                          src={challenge.challenger_picture} 
                          fill 
                          alt="challenger" 
                          className="object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#14919B]">
                          <User size={20} />
                        </div>
                      )}
                     </div>
                     <p className="text-[10px] font-bold truncate w-16 mx-auto">{challenge.challenger_name}</p>
                   </div>

                   <div className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black italic">VS</div>

                   <div className="text-center">
                     <div className="relative w-10 h-10 mx-auto mb-1">
                      {challenge.challenged_picture ? (
                        <Image 
                          src={challenge.challenged_picture} 
                          fill 
                          alt="challenged" 
                          className="object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#14919B]">
                          <User size={20} />
                        </div>
                      )}
                     </div>
                     <p className="text-[10px] font-bold truncate w-16 mx-auto">{challenge.challenged_name}</p>
                   </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-bold text-gray-400 -mb-2">
                    <span>{challenge.challenger_name}</span>
                    <span>Goal: {challenge.goal_value}m</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#14919B]" style={{ width: '0%' }} />
                  </div>
                  
                  <div className="flex justify-between text-[9px] font-bold text-gray-400 -mb-2">
                    <span>{challenge.challenged_name}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-8 rounded-[2rem] text-center">
            <p className="text-gray-400 text-sm italic">No active duels. Go to Community to challenge a friend!</p>
          </div>
        )}
      </div>
    </div>
  );
}