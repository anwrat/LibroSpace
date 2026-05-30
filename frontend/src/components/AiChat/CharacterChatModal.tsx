"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { getCharacterGreeting, getCharacterResponse } from "@/lib/user";
import { Send, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  sender: "user" | "character";
  text: string;
  timestamp: Date;
}

interface CharacterChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
}

export default function CharacterChatModal({
  isOpen,
  onClose,
  bookTitle,
  bookAuthor,
  bookCover,
}: CharacterChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingGreeting, setLoadingGreeting] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load the initial character greeting when opened
  useEffect(() => {
    if (!isOpen) return;

    async function loadGreeting() {
      try {
        setLoadingGreeting(true);
        const res = await getCharacterGreeting(bookTitle, bookAuthor);

        if (res?.data?.greeting) {
          setMessages([
            {
              id: "greeting",
              sender: "character",
              text: res.data.greeting,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading greeting:", error);
        toast.error("Failed to establish contact with the character.");
      } finally {
        setLoadingGreeting(false);
      }
    }

    loadGreeting();
  }, [isOpen, bookTitle, bookAuthor]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sendingMessage) return;

    const userText = inputValue.trim();
    setInputValue("");

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: userText,
      timestamp: new Date(),
    };

    // Extract the initial greeting text dynamically from your message history state
    const initialGreetingText =
      messages.find((msg) => msg.id === "greeting")?.text || "";

    // Build the middle conversation log, skipping the initial greeting
    // to avoid duplicating it within the payload context window
    const dynamicHistoryTranscript = messages
      .filter((msg) => msg.id !== "greeting")
      .map(
        (msg) =>
          `${msg.sender === "user" ? "Reader" : "Character"}: ${msg.text}`,
      )
      .join("\n");

    setMessages((prev) => [...prev, userMessage]);
    setSendingMessage(true);

    try {
      // System instructions explicitly binding the AI to the specific persona established in the greeting
      const builtPrompt = `You are a fictional character from the book "${bookTitle}" by ${bookAuthor}. 

CRUCIAL PERSISTENCE RULE: At the start of this session, you introduced yourself with this exact greeting:
"${initialGreetingText}"

You must stick strictly to the exact same character identity who spoke that line. Do NOT switch characters, do NOT break character, and do NOT alter your relationship or tone with the reader.

This is how the conversation has progressed since your greeting:
${dynamicHistoryTranscript}
Reader: ${userText}

Character:`;

      const res = await getCharacterResponse(builtPrompt);

      if (res?.data?.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: "character",
            text: res.data.response,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error getting character reply:", error);
      toast.error("The character seems unresponsive right now.");
    } finally {
      setSendingMessage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl h-[85vh] max-h-[700px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
        {/* --- MODAL HEADER --- */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="relative w-12 aspect-2/3 shadow-xs rounded-md overflow-hidden bg-white border border-gray-100">
              <Image
                src={bookCover}
                alt={bookTitle}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#14919B] bg-[#14919B]/10 px-2 py-0.5 rounded-full">
                Character Chat Room
              </span>
              <h3 className="text-lg font-black text-gray-900 truncate max-w-[300px] sm:max-w-[400px]">
                {bookTitle}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                By {bookAuthor}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 bg-white border border-gray-100 shadow-xs rounded-full transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* --- CHAT LOG --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white max-h-[calc(100%-150px)]">
          {loadingGreeting ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="animate-spin text-[#14919B]" size={32} />
              <p className="text-xs font-bold uppercase tracking-wider animate-pulse">
                Summoning character from pages...
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-xs ${
                      msg.sender === "user"
                        ? "bg-[#14919B] text-white rounded-br-none"
                        : "bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    <p className={msg.sender === "character" ? "italic" : ""}>
                      {msg.text}
                    </p>
                    <span className="block text-[9px] font-bold mt-2 uppercase tracking-widest text-right text-gray-400">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {sendingMessage && (
                <div className="flex w-full justify-start">
                  <div className="bg-gray-50 border border-gray-100 text-gray-400 px-4 py-3 rounded-[1.5rem] rounded-bl-none flex items-center gap-2">
                    <Loader2
                      className="animate-spin text-[#14919B]"
                      size={14}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider animate-pulse">
                      Typing...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* --- FORM ACTION LAYOUT --- */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loadingGreeting || sendingMessage}
            placeholder={
              sendingMessage
                ? "Waiting for reply..."
                : "Talk to the character..."
            }
            className="flex-1 p-3.5 rounded-xl bg-gray-50 border-2 border-transparent focus:border-[#14919B] focus:bg-white outline-none transition-all text-sm text-gray-700 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || sendingMessage || loadingGreeting}
            className="bg-[#14919B] text-white p-3.5 rounded-xl hover:bg-[#0f7178] transition-all disabled:opacity-40 disabled:bg-gray-300 shadow-md active:scale-95 shrink-0 flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
