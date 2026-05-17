// Reusable Metric Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  bg: string;
}

export default function StatCard({ title, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xs flex items-center justify-between group hover:border-[#14919B]/30 transition-all duration-300">
      <div>
        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{title}</p>
        <h2 className="text-4xl font-black text-gray-900 mt-2 tracking-tight">
          {value.toLocaleString()}
        </h2>
      </div>
      <div className={`h-14 w-14 ${bg} ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
        <Icon size={26} />
      </div>
    </div>
  );
}