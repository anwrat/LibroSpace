'use client';

import { useEffect, useState, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import UserNav from "@/components/Navbar/UserNav";
import { Send, MessageSquare, Search, Loader2, Check, CheckCheck, BookOpen } from "lucide-react";
import { getAllFriends, getChatHistory, markMessagesAsRead, getAcceptedSwaps } from "@/lib/user"; 
import { useAuthContext } from "@/context/AuthContext";

export default function MessagesPage() {
    const { user } = useAuthContext();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [acceptedSwaps, setAcceptedSwaps] = useState<any[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);    
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Initialize Socket Connection
    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000", {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        setSocket(newSocket);

        newSocket.on("online_users", (list: number[]) => {
            setOnlineUsers(list);
        });

        newSocket.on("receive_message", (message) => {
            setMessages((prev) => {
                const exists = prev.find(m => m.id === message.id);
                if (exists) return prev;
                return [...prev, message];
            });

            // Mark as read if the chat is currently open
            if (selectedFriend?.id === message.sender_id) {
                newSocket.emit("mark_as_read", { senderId: message.sender_id });
            }
        });

        newSocket.on("messages_seen", ({ readBy }) => {
            setMessages((prev) => 
                prev.map(m => m.receiver_id === readBy ? { ...m, is_read: true } : m)
            );
        });

        newSocket.on("message_sent_success", (savedMsg) => {
            setMessages((prev) => [...prev, savedMsg]);
        });

        return () => { newSocket.disconnect(); };
    }, [selectedFriend]);

    // 2. Fetch Data (Friends + Accepted Swaps)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [friendsRes, swapsRes] = await Promise.all([
                    getAllFriends(),
                    getAcceptedSwaps()
                ]);
                
                setFriends(friendsRes.data.friends || []);
                setAcceptedSwaps(swapsRes.data.data || []);
            } catch (err) {
                console.error("Error fetching chat data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 3. Merge and Unique-ify the Chat List
    const chatList = useMemo(() => {
        // Map swaps to a standard format using partner_id and partner_name
        const swapUsers = acceptedSwaps.map(swap => ({
            id: swap.partner_id,
            name: swap.partner_name,
            isSwapPartner: true,
            bookTitle: swap.target_book_title
        }));

        // Combine Friends and Swap Partners
        const combined = [...friends, ...swapUsers];

        // Deduplicate: If an ID exists twice, merge them into one entry
        const unique = combined.reduce((acc: any[], current) => {
            const existing = acc.find(item => Number(item.id) === Number(current.id));
            if (!existing) {
                acc.push(current);
            } else if (current.isSwapPartner) {
                // If we found a swap entry for an existing friend, upgrade the entry
                existing.isSwapPartner = true;
                existing.bookTitle = current.bookTitle;
            }
            return acc;
        }, []);

        // Search Filter
        return unique.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [friends, acceptedSwaps, searchQuery]);

    // 4. Load Chat History
    useEffect(() => {
        if (selectedFriend) {
            const loadChat = async () => {
                try {
                    const res = await getChatHistory(selectedFriend.id);
                    setMessages(res.data.data || []);
                    await markMessagesAsRead(selectedFriend.id);
                    socket?.emit("mark_as_read", { senderId: selectedFriend.id });
                } catch (err) {
                    console.error("Error loading chat:", err);
                }
            };
            loadChat();
        }
    }, [selectedFriend, socket]);

    // 5. Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !selectedFriend) return;

        socket.emit("send_private_message", {
            receiverId: selectedFriend.id,
            content: newMessage.trim(),
        });
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
                
                {/* Left Sidebar */}
                <aside className="w-80 border-r flex flex-col bg-gray-50/30">
                    <div className="p-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-4 italic">Conversations</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search people..." 
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#14919B]/20" 
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {chatList.length > 0 ? chatList.map((contact) => {
                            const isOnline = onlineUsers.includes(Number(contact.id));
                            return (
                                <button 
                                    key={contact.id}
                                    onClick={() => setSelectedFriend(contact)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 transition-all relative ${
                                        selectedFriend?.id === contact.id ? "bg-white border-r-4 border-r-[#14919B] shadow-sm" : "hover:bg-gray-100/50"
                                    }`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-[#14919B]/10 flex items-center justify-center font-bold text-[#14919B] border border-[#14919B]/20">
                                            {contact.name[0].toUpperCase()}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="font-black text-gray-900 truncate flex items-center gap-2">
                                            {contact.name}
                                            {contact.isSwapPartner && <BookOpen size={12} className="text-[#14919B]" />}
                                        </p>
                                        <p className={`text-[10px] font-black uppercase tracking-wider truncate ${contact.isSwapPartner ? 'text-[#14919B]' : 'text-gray-400'}`}>
                                            {contact.isSwapPartner ? `Swap: ${contact.bookTitle}` : (isOnline ? 'Online' : 'Offline')}
                                        </p>
                                    </div>
                                </button>
                            );
                        }) : (
                            <div className="p-10 text-center text-gray-400 text-sm italic">
                                No conversations found
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right Chat Window */}
                <section className="flex-1 flex flex-col bg-white">
                    {selectedFriend ? (
                        <>
                            <div className="p-6 border-b flex items-center justify-between bg-white/50 backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-[#14919B]">
                                        {selectedFriend.name[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-gray-900 leading-none italic truncate">{selectedFriend.name}</h3>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#14919B] block mt-1 truncate">
                                            {selectedFriend.isSwapPartner 
                                                ? `Coordinating Swap: ${selectedFriend.bookTitle}` 
                                                : (onlineUsers.includes(Number(selectedFriend.id)) ? 'Active Now' : 'Last seen recently')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                                {messages.map((msg, idx) => {
                                    const isMe = Number(msg.sender_id) === Number(user?.id);
                                    return (
                                        <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] px-5 py-3 rounded-[1.8rem] text-sm font-medium shadow-sm ${
                                                isMe ? "bg-[#14919B] text-white rounded-tr-none" : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
                                            }`}>
                                                {msg.content}
                                                <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[9px]">
                                                    {msg.created_at && new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && (
                                                        msg.is_read ? <CheckCheck size={12} className="text-blue-200" /> : <Check size={12} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>

                            <form onSubmit={sendMessage} className="p-6 border-t bg-white flex gap-4 items-center">
                                <input 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Write a message..."
                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-[1.5rem] px-6 py-4 outline-none focus:ring-2 focus:ring-[#14919B]/20 text-sm"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim()}
                                    className="bg-[#14919B] text-white p-4 rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                            <MessageSquare size={60} strokeWidth={1} className="mb-4 opacity-20" />
                            <p className="font-black text-gray-400 italic">Select a conversation to start reading</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}