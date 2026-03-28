'use client';

import { useState, useRef } from "react";
import { X, Book, User, MapPin, Info, Camera, Loader2, Check, Sparkles, Image as ImageIcon } from "lucide-react";
import { joinExchange } from "@/lib/user"; 

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinExchangeModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    book_title: "",
    book_author: "",
    condition: "Good",
    location_city: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a local URL for the preview (does not upload anywhere)
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Create FormData to send both text and the file in one go
    const data = new FormData();
    data.append("book_title", formData.book_title);
    data.append("book_author", formData.book_author);
    data.append("condition", formData.condition);
    data.append("location_city", formData.location_city);
    data.append("description", formData.description);
    
    if (selectedFile) {
      data.append("image", selectedFile);
    }

    try {
      const res = await joinExchange(data);
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Join error:", err);
      alert("Failed to join. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Worn'];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-[#14919B] p-8 text-white relative">
          <button 
            onClick={onClose}
            type="button"
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-3xl font-black mb-2 italic">List Your Book</h2>
          <p className="text-[#e2f7f9] text-sm font-medium">Enter the details of the book you'd like to exchange.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Image Upload Area */}
          <div className="space-y-2">
             <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Camera size={14} /> Book Cover Photo
              </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-48 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden group"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-sm">
                    Change Photo
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon size={40} className="text-gray-300 mb-2" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Click to upload photo</p>
                </>
              )}
            </div>
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Book size={14} /> Book Title
              </label>
              <input 
                required
                type="text"
                placeholder="e.g. The Great Gatsby"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#14919B]/20 transition-all font-medium"
                value={formData.book_title}
                onChange={(e) => setFormData({...formData, book_title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <User size={14} /> Author
              </label>
              <input 
                required
                type="text"
                placeholder="F. Scott Fitzgerald"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#14919B]/20 transition-all font-medium"
                value={formData.book_author}
                onChange={(e) => setFormData({...formData, book_author: e.target.value})}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Sparkles size={14} /> Condition
              </label>
              <select 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none appearance-none font-medium cursor-pointer"
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
              >
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <MapPin size={14} /> Your City
              </label>
              <input 
                required
                type="text"
                placeholder="e.g. New York, NY"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#14919B]/20 transition-all font-medium"
                value={formData.location_city}
                onChange={(e) => setFormData({...formData, location_city: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Info size={14} /> Short Note
            </label>
            <textarea 
              rows={3}
              placeholder="Tell other readers why they should read this..."
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#14919B]/20 transition-all font-medium resize-none text-sm"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#14919B] text-white rounded-[2rem] font-black text-lg hover:bg-[#0e6b72] transition-colors shadow-lg shadow-[#14919B]/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Check size={20} />}
            {loading ? "Processing..." : "Complete Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}