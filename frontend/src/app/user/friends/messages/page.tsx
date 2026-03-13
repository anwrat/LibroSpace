'use client';

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import UserNav from "@/components/Navbar/UserNav";
import { Send, MessageSquare, Search, Loader2 } from "lucide-react";
import { getAllFriends, getChatHistory } from "@/lib/user"; 
import { useAuthContext } from "@/context/AuthContext";

export default function MessagesPage() {
    const {user} = useAuthContext();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Initialize Socket Connection with Cookie Token
    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000", {
            withCredentials: true,
            transports: ['websocker','polling']
        });

        setSocket(newSocket);

        // Listen for incoming messages
        newSocket.on("receive_message", (message) => {
            // Check if the message belongs to the current open conversation
            setMessages((prev) => {
                // Prevent duplicate messages if sender and receiver are the same in state
                const exists = prev.find(m => m.id === message.id);
                if (exists) return prev;
                return [...prev, message];
            });
        });

        // Listen for successful send confirmation from server
        newSocket.on("message_sent_success", (savedMsg) => {
            setMessages((prev) => [...prev, savedMsg]);
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket Connection Error:", err.message);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // 2. Fetch Friend List
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await getAllFriends();
                setFriends(res.data.friends || []);
            } catch (err) {
                console.error("Error fetching friends:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, []);

    // 3. Load Chat History when a friend is selected
    useEffect(() => {
        if (selectedFriend) {
            const fetchHistory = async () => {
                try {
                    const res = await getChatHistory(selectedFriend.id);
                    setMessages(res.data.data || []);
                } catch (err) {
                    console.error("Error fetching history:", err);
                }
            };
            fetchHistory();
        }
    }, [selectedFriend]);

    // 4. Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !selectedFriend) return;

        const messageData = {
            receiverId: selectedFriend.id,
            content: newMessage.trim(),
        };

        // Emit to server (Server handles senderId via JWT)
        socket.emit("send_private_message", messageData);

        // Clear input (We wait for 'message_sent_success' or 'receive_message' to update UI)
        setNewMessage("");
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#14919B]" size={40} />
        </div>
    );

    return (
        <main className="h-screen bg-gray-50 flex flex-col font-main overflow-hidden">
            <UserNav />
            
            <div className="flex-1 mt-20 flex overflow-hidden max-w-7xl mx-auto w-full border-x border-gray-100 bg-white shadow-2xl">
                
                {/* Left: Friend List Sidebar */}
                <aside className="w-80 border-r flex flex-col bg-gray-50/30">
                    <div className="p-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                placeholder="Search friends..." 
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#14919B]/20 transition-all" 
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {friends.length > 0 ? (
                            friends.map((friend) => (
                                <button 
                                    key={friend.id}
                                    onClick={() => setSelectedFriend(friend)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${
                                        selectedFriend?.id === friend.id 
                                        ? "bg-white border-r-4 border-r-[#14919B] shadow-sm" 
                                        : "hover:bg-gray-100/50"
                                    }`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-[#14919B]/10 flex items-center justify-center font-bold text-[#14919B] border border-[#14919B]/20">
                                            {friend.name[0].toUpperCase()}
                                        </div>
                                        {/* Optional Online Indicator dot could go here */}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-gray-900 truncate">{friend.name}</p>
                                        <p className="text-xs text-gray-400 font-medium truncate">Active now</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-400 text-sm italic">No friends found</div>
                        )}
                    </div>
                </aside>

                {/* Right: Chat Window */}
                <section className="flex-1 flex flex-col bg-white">
                    {selectedFriend ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 border-b flex items-center justify-between bg-white/50 backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-[#14919B]">
                                        {selectedFriend.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 leading-none">{selectedFriend.name}</h3>
                                        <span className="text-[10px] text-[#14919B] font-bold uppercase tracking-wider">Online</span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                                {messages.map((msg, idx) => {
                                    const senderId = msg.sender_id;
                                    const currentUserId = Number(user?.id);
                                    const isMe = senderId === currentUserId;

                                    return (
                                        <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] px-5 py-3 rounded-[1.8rem] text-sm font-medium shadow-sm leading-relaxed ${
                                                isMe 
                                                ? "bg-[#14919B] text-white rounded-tr-none shadow-[#14919B]/20" 
                                                : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
                                            }`}>
                                                {msg.content}
                                                <p className={`text-[9px] mt-1 opacity-60 ${isMe ? "text-right" : "text-left"}`}>
                                                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={sendMessage} className="p-6 border-t bg-white flex gap-4 items-center">
                                <input 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Write a message..."
                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-[1.5rem] px-6 py-4 outline-none focus:ring-2 focus:ring-[#14919B]/20 transition-all text-sm"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim()}
                                    className="bg-[#14919B] text-white p-4 rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-[#14919B]/20"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50/20">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-gray-100 flex items-center justify-center mb-4">
                                <MessageSquare size={40} strokeWidth={1.5} className="text-gray-300" />
                            </div>
                            <p className="font-bold text-gray-400">Select a friend to start chatting</p>
                            <p className="text-xs text-gray-300 mt-1">Your conversations will appear here</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}