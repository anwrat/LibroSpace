'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { Mic, MicOff, Video, VideoOff, PhoneOff, BookOpen, Info, LogOut } from 'lucide-react';
import UserNav from "@/components/Navbar/UserNav";
import { getActiveRoom, endRoom } from '@/lib/user';
import { useAuthContext } from '@/context/AuthContext';

interface BookDetails {
  book_title: string;
  cover_url?: string;
  author?: string;
  description?: string;
  pagecount?: number | string;
  host_id?: number; // Capturing host mapping identifier from join schema
  room_id?: number; // Room identification key for termination
  [key: string]: any; 
}

export default function LiveRoomPage() {
  const { user } = useAuthContext();
  const params = useParams();
  const router = useRouter();
  const communityId = params.id;
  
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [peers, setPeers] = useState<any[]>([]);
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<any[]>([]);
  const userStream = useRef<MediaStream | null>(null);
  const socketRef = useRef<any>(null);

  const isHost = user && bookDetails && Number(user.id) === Number(bookDetails.host_id);

  // Helper helper to turn off media tracks cleanly
  const stopLocalMediaTracks = () => {
    if (userStream.current) {
      userStream.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Track ${track.kind} stopped successfully.`);
      });
      userStream.current = null;
    }
  };

  // 1. Fetch Room Metadata
  useEffect(() => {
    if (!communityId) return;

    const fetchRoomData = async () => {
      try {
        setLoadingRoom(true);
        const response = await getActiveRoom(Number(communityId));
        
        if (response?.data?.data && response.data.data.length > 0) {
          console.log(response.data.data[0]);
          setBookDetails(response.data.data[0]);
        } else if (response && !Array.isArray(response)) {
          setBookDetails(null);
        }
      } catch (error) {
        console.error("Error retrieving live room book details:", error);
      } finally {
        setLoadingRoom(false);
      }
    };

    fetchRoomData();
  }, [communityId]);

  // 2. Real-Time WebRTC Connection Management
  useEffect(() => {
    if (!communityId) return;

    const baseApi = process.env.NEXT_PUBLIC_API_BASE ;
    
    const socket = io(`${baseApi}/live`, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    
    socketRef.current = socket;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userStream.current = stream;
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }

        socket.emit("join-room", { communityId });

        socket.on("all-users", (users: string[]) => {
          console.log("Existing users inside this call space:", users);
          const peersList: any[] = [];
          
          users.forEach((socketId) => {
            const peer = createPeer(socketId, socket.id!, stream);
            
            peersRef.current.push({
              peerID: socketId,
              peer,
            });
            
            peersList.push({
              peerID: socketId,
              peer,
            });
          });
          setPeers(peersList);
        });

        socket.on("user-joined", (payload: { signal: any; callerID: string }) => {
          console.log("Processing incoming peer join request from:", payload.callerID);
          
          const existingPeer = peersRef.current.find(p => p.peerID === payload.callerID);
          if (existingPeer) return;

          const peer = addPeer(payload.signal, payload.callerID, stream);
          
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });
          
          setPeers((prevPeers) => [...prevPeers, { peerID: payload.callerID, peer }]);
        });

        socket.on("receiving-returned-signal", (payload: { signal: any; id: string }) => {
          console.log("WebRTC Loopback handshake complete for peer:", payload.id);
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          if (item) {
            item.peer.signal(payload.signal);
          }
        });

        socket.on("user-disconnected", (disconnectedSocketId: string) => {
          console.log("Peer disconnected from call:", disconnectedSocketId);
          const peerObj = peersRef.current.find((p) => p.peerID === disconnectedSocketId);
          if (peerObj) {
            peerObj.peer.destroy(); 
          }
          
          peersRef.current = peersRef.current.filter((p) => p.peerID !== disconnectedSocketId);
          setPeers((prevPeers) => prevPeers.filter((p) => p.peerID !== disconnectedSocketId));
        });

        // 3. Kickout Execution Event Broadcasted by Server Namespace when room ends
        socket.on("room-ended", () => {
          console.log("The room has been closed by the host. Evicting and stopping hardware links...");
          stopLocalMediaTracks();
          router.push(`/user/community/${communityId}`); // Redirect back to community page
        });
      })
      .catch((err) => {
        console.error("Failed to access local media devices:", err);
      });

    function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
      const peer = new Peer({ initiator: true, trickle: false, stream });

      peer.on("signal", (signal) => {
        socket.emit("sending-signal", { userToSignal, callerID, signal });
      });

      return peer;
    }

    function addPeer(incomingSignal: any, callerID: string, stream: MediaStream) {
      const peer = new Peer({ initiator: false, trickle: false, stream });

      peer.on("signal", (signal) => {
        socket.emit("returning-signal", { signal, callerID });
      });

      peer.signal(incomingSignal);
      return peer;
    }

    return () => {
      stopLocalMediaTracks();
      if (socketRef.current) {
        console.log("Teardown active room session links...");
        socketRef.current.emit("leave-room", { communityId });
        socketRef.current.disconnect();
      }
    };
  }, [communityId, router]);

  const toggleMic = () => {
    if (userStream.current) {
      const audioTrack = userStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micOn;
        setMicOn(!micOn);
      }
    }
  };

  const toggleVideo = () => {
    if (userStream.current) {
      const videoTrack = userStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoOn;
        setVideoOn(!videoOn);
      }
    }
  };

  // Explicit termination engine orchestrating standard exit or total workspace dismantling
  const handleExitSession = async () => {
    if (isHost && bookDetails?.room_id) {
      try {
        // 1. Terminate the room entry record across db structures via HTTP Data Bridge Layer
        await endRoom(Number(bookDetails.room_id));
        
        // 2. Alert WS Server namespace to push out all streaming listeners concurrently
        if (socketRef.current) {
          socketRef.current.emit("host-ended-room", { communityId });
        }
      } catch (err) {
        console.error("Failed to cleanly collapse the database session entry:", err);
      }
    }
    
    // Stop local hardware devices and leave room layout execution view
    stopLocalMediaTracks();
    router.push(`/user/community/${communityId}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-main overflow-hidden">
      <UserNav />
      
      <div className="pt-24 px-6 w-full max-w-7xl mx-auto h-[calc(100vh-20px)] flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] overflow-hidden">
          
          {/* LEFT PANEL: Book Showcase */}
          <div className="lg:col-span-4 bg-gray-900/60 border border-white/5 backdrop-blur-md rounded-3xl p-6 flex flex-col overflow-y-auto custom-scrollbar">
            {loadingRoom ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-gray-400">
                <div className="w-8 h-8 border-4 border-[#14919B] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Loading book context companion...</p>
              </div>
            ) : bookDetails ? (
              <div className="flex flex-col space-y-6">
                <div className="flex items-center gap-2 text-xs text-[#14919B] font-semibold tracking-wider uppercase">
                  <BookOpen size={14} />
                  <span>Currently Discussing</span>
                </div>

                <div className="relative aspect-3/4 w-48 mx-auto rounded-2xl overflow-hidden shadow-2xl bg-gray-800 border border-white/10 group">
                  {bookDetails.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={bookDetails.cover_url} 
                      alt={bookDetails.book_title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-gray-500">
                      <BookOpen size={48} className="mb-2 stroke-[1.5]" />
                      <span className="text-xs">No Cover Available</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center lg:text-left">
                  <h1 className="text-2xl font-bold tracking-tight text-white leading-snug">
                    {bookDetails.book_title}
                  </h1>
                  {bookDetails.author && (
                    <p className="text-gray-400 text-sm font-medium">
                      by <span className="text-gray-200">{bookDetails.author}</span>
                    </p>
                  )}
                </div>

                <div className="h-px bg-white/5 w-full" />

                <div className="grid grid-cols-1 gap-3">
                  {bookDetails.pagecount && (
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1">Length</span>
                      <span className="text-xs font-semibold text-gray-300">{bookDetails.pagecount} pages</span>
                    </div>
                  )}
                </div>

                {bookDetails.description && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block">Synopsis</span>
                    <p className="text-sm text-gray-400 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5 max-h-48 overflow-y-auto custom-scrollbar">
                      {bookDetails.description}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <Info size={40} className="mb-2 text-gray-600 stroke-[1.5]" />
                <p className="text-sm">No book details linked to this call session.</p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Video Grid Streams */}
          <div className="lg:col-span-8 bg-gray-900/20 rounded-3xl flex flex-col overflow-y-auto pb-12 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
              
              {/* Local Feed */}
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video border-2 border-[#14919B] shadow-lg">
                <video muted ref={userVideo} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold tracking-wide text-white">
                  You {isHost && <span className="text-[#14919B] ml-1">(Host)</span>}
                </div>
              </div>

              {/* Connected Streaming Peers */}
              {peers.map((peerObj) => (
                <VideoCard key={peerObj.peerID} peer={peerObj.peer} peerID={peerObj.peerID} />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Action Controls Panel */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-[2.5rem] flex items-center gap-6 shadow-2xl z-50">
          <button 
            onClick={toggleMic} 
            className={`p-4 rounded-2xl transition-all active:scale-95 ${micOn ? 'bg-white/5 hover:bg-white/10 text-gray-200' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
          >
            {micOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          
          <button 
            onClick={toggleVideo} 
            className={`p-4 rounded-2xl transition-all active:scale-95 ${videoOn ? 'bg-white/5 hover:bg-white/10 text-gray-200' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
          >
            {videoOn ? <Video size={22} /> : <VideoOff size={22} />}
          </button>

          <div className="h-8 w-px bg-white/10 mx-1" />

          {/* Dynamic Button UI configuration changing colors/icon dynamically based on Host Context */}
          <button 
            onClick={handleExitSession}
            title={isHost ? "End call for everyone" : "Leave conversation"}
            className={`active:scale-95 p-4 rounded-2xl text-white transition-all shadow-lg flex items-center gap-2 ${
              isHost 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' 
                : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
            }`}
          >
            {isHost ? <PhoneOff size={22} /> : <LogOut size={22} />}
            <span className="text-xs font-bold hidden sm:inline px-1">
              {isHost ? "End Room" : "Leave"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ peer, peerID }: { peer: any; peerID: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!peer) return;
    
    const handleStream = (stream: MediaStream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    };

    peer.on("stream", handleStream);
    return () => {
      peer.off("stream", handleStream);
    };
  }, [peer]);

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video border border-white/5 shadow-md hover:border-white/10 transition-colors">
      <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold text-gray-300 tracking-wide">
        Peer ({peerID.substring(0, 5)})
      </div>
    </div>
  );
}