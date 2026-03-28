import { Sparkles, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onJoin: () => void;
}

export default function HeroSection({ onJoin }: HeroSectionProps) {
  return (
    <div className="max-w-4xl mx-auto text-center py-20 animate-in fade-in slide-in-from-top-8 duration-1000">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-[#14919B]/10 text-[#14919B] px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-sm border border-[#14919B]/5">
        <Sparkles size={14} className="animate-pulse" /> 
        Limited Time Event
      </div>

      {/* Main Title */}
      <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.9] italic">
        The Great <br />
        <span className="text-[#14919B] relative">
          Book Exchange
          <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#14919B]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0 5 Q 25 0 50 5 T 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
          </svg>
        </span>
      </h1>

      {/* Description */}
      <p className="text-xl md:text-2xl text-gray-500 mb-14 leading-relaxed font-medium max-w-2xl mx-auto">
        Don’t let your favorites gather dust. Swap your stories with fellow readers and discover your next obsession.
      </p>

      {/* Call to Action */}
      <div className="relative inline-block group">
        <div className="absolute -inset-4 bg-[#14919B]/20 rounded-[3rem] blur-xl group-hover:bg-[#14919B]/30 transition-all duration-500 opacity-0 group-hover:opacity-100" />
        <button 
          onClick={onJoin}
          className="relative bg-[#14919B] text-white px-12 py-7 rounded-[2.5rem] font-black text-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-5 mx-auto shadow-2xl shadow-[#14919B]/30"
        >
          List a Book to Enter 
          <ArrowRight className="group-hover:translate-x-2 transition-transform duration-300" strokeWidth={3} />
        </button>
      </div>

      {/* Trust/Stats Footer */}
      <div className="mt-20 flex items-center justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900 italic">500+</p>
          <p className="text-[10px] font-bold uppercase tracking-widest">Books Swapped</p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900 italic">Local</p>
          <p className="text-[10px] font-bold uppercase tracking-widest">Exchanges Only</p>
        </div>
      </div>
    </div>
  );
}