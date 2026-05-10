'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  Settings, Users, ShieldAlert 
} from 'lucide-react';
import UserNav from "@/components/Navbar/UserNav";

const socket = io(process.env.NEXT_PUBLIC_API_BASE);

export default function LiveRoomPage() {
  const params = useParams();
  const communityId = params.id;
  
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [peers, setPeers] = useState<any[]>([]);
  
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<any[]>([]);
  const userStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    // 1. Get User Media (Camera/Mic)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      userStream.current = stream;
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }

      // 2. Join the Socket Room
      socket.emit("join-room", { communityId });

      // 3. When a new user joins, create a peer for them
      socket.on("all-users", (users: string[]) => {
        const peers: any[] = [];
        users.forEach((userId) => {
          const peer = createPeer(userId, socket.id!, stream);
          peersRef.current.push({
            peerID: userId,
            peer,
          });
          peers.push({
            peerID: userId,
            peer,
          });
        });
        setPeers(peers);
      });

      // 4. Handle receiving a signal from a new peer
      socket.on("user-joined", (payload: any) => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({
          peerID: payload.callerID,
          peer,
        });
        setPeers((users) => [...users, { peerID: payload.callerID, peer }]);
      });

      // 5. Complete the handshake
      socket.on("receiving-returned-signal", (payload: any) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        if (item) item.peer.signal(payload.signal);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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

  const toggleMic = () => {
    if (userStream.current) {
      userStream.current.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    if (userStream.current) {
      userStream.current.getVideoTracks()[0].enabled = !videoOn;
      setVideoOn(!videoOn);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-main">
      <UserNav />
      
      <div className="pt-24 px-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-24">
          {/* Local Video */}
          <div className="relative bg-gray-900 rounded-3xl overflow-hidden aspect-video border-2 border-[#14919B]">
            <video muted ref={userVideo} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-xs font-bold">
              You (Host)
            </div>
          </div>

          {/* Remote Videos */}
          {peers.map((peerObj) => (
            <VideoCard key={peerObj.peerID} peer={peerObj.peer} />
          ))}
        </div>

        {/* Controls Bar */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
          <button onClick={toggleMic} className={`p-4 rounded-2xl transition-colors ${micOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500'}`}>
            {micOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          
          <button onClick={toggleVideo} className={`p-4 rounded-2xl transition-colors ${videoOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500'}`}>
            {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          <div className="h-8 w-px bg-white/10 mx-2" />

          <button 
            onClick={() => window.history.back()}
            className="bg-red-500 hover:bg-red-600 p-4 rounded-2xl text-white transition-all hover:scale-105"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component for remote peers
function VideoCard({ peer }: { peer: any }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on("stream", (stream: MediaStream) => {
      if (ref.current) ref.current.srcObject = stream;
    });
  }, [peer]);

  return (
    <div className="relative bg-gray-900 rounded-3xl overflow-hidden aspect-video border border-white/5">
      <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
    </div>
  );
}