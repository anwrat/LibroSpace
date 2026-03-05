'use client';

import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { startDiscussion } from "@/lib/user";

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: number;
  onSuccess: () => void;
}

export default function NewPostModal({ 
  isOpen, 
  onClose, 
  communityId, 
  onSuccess 
}: NewPostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      await startDiscussion(communityId, title, content);
      // Reset form on success
      setTitle("");
      setContent("");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <form 
        onSubmit={handleSubmit} 
        className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200"
      >
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black text-gray-900 mb-6">Start a Discussion</h2>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">
              Topic Title
            </label>
            <input 
              autoFocus
              placeholder="Give your post a title..."
              className="w-full text-xl font-bold border-b-2 border-gray-100 focus:border-[#14919B] outline-none pb-2 transition-all placeholder:text-gray-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">
              Content
            </label>
            <textarea 
              placeholder="What's on your mind?"
              className="w-full min-h-[200px] text-gray-600 border-none outline-none resize-none whitespace-pre-wrap leading-relaxed placeholder:text-gray-200"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !title.trim() || !content.trim()}
            className="w-full bg-[#14919B] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#0f7178] transition-all shadow-lg shadow-[#14919B]/20 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={18} />
                <span>Post to Community</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}