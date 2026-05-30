import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onJoin: () => void;
}

export default function HeroSection({ onJoin }: HeroSectionProps) {
  return (
    <div
      className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center relative overflow-hidden animate-in fade-in slide-in-from-top-8 duration-1000 bg-white"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.95)), url('/BookExchange/bookexchange.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-7xl mx-auto text-center px-6 relative z-10 py-20">
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.9] italic">
          The Great <br />
          <span className="text-[#14919B] relative">
            Book Exchange
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-[#14919B]/20"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 25 0 50 5 T 100 5"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
              />
            </svg>
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 mb-14 leading-relaxed font-bold max-w-2xl mx-auto bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-white/20 shadow-sm sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:shadow-none">
          Don’t let your favorites gather dust. Swap your stories with fellow
          readers and discover your next obsession.
        </p>

        <div className="relative inline-block group">
          <div className="absolute -inset-4 bg-[#14919B]/20 rounded-[3rem] blur-xl group-hover:bg-[#14919B]/30 transition-all duration-500 opacity-0 group-hover:opacity-100" />
          <button
            onClick={onJoin}
            className="relative bg-[#14919B] text-white px-12 py-7 rounded-[2.5rem] font-black text-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-5 mx-auto shadow-2xl shadow-[#14919B]/30"
          >
            List a Book to Enter
            <ArrowRight
              className="group-hover:translate-x-2 transition-transform duration-300"
              strokeWidth={3}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
