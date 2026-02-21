'use client';

import { useState } from "react";
import { X, BookOpen, Loader2 } from "lucide-react";

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (endPage: number) => void;
  loading: boolean;
  startPage: number;
}

export default function EndSessionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading, 
  startPage 
}: EndSessionModalProps) {
  const [endPage, setEndPage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = Number(endPage);

    if (!endPage || pageNum <= 0) {
      setError("Please enter a valid page number.");
      return;
    }

    if (pageNum < startPage) {
      setError(`You started at page ${startPage}. Did you read backwards?`);
      return;
    }

    setError(null);
    onConfirm(pageNum);
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
        
        {/* Close Button */}
        {!loading && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        )}

        {/* Content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-[#14919B]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#14919B]">
            <BookOpen size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-2">Great Progress!</h2>
          <p className="text-gray-500 text-sm mb-8 px-4">
            Finish line! Just enter the page number where you stopped to update your shelf progress.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                Ending Page
              </label>
              <input
                autoFocus
                type="number"
                placeholder={String(startPage + 1)}
                className={`w-full px-6 py-5 bg-gray-50 border-2 rounded-2xl text-center text-3xl font-black transition-all outline-none 
                  ${error ? 'border-red-200 focus:border-red-500' : 'border-transparent focus:bg-white focus:border-[#14919B]'}`}
                value={endPage}
                onChange={(e) => {
                  setEndPage(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
              />
              {error && (
                <p className="text-red-500 text-xs font-bold mt-3 animate-pulse">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#14919B] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-[#14919B]/20 hover:bg-[#0f7178] hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Saving Session...
                </>
              ) : (
                "Complete Reading"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}