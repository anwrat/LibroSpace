'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { Timer, BookOpen, Zap, Target, Loader2 } from 'lucide-react';
import { getReadingInsights } from '@/lib/user'; 

export default function ReadingInsights() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await getReadingInsights();
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to load insights:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-gray-100">
      <Loader2 className="animate-spin text-[#14919B] mb-4" size={32} />
      <p className="text-gray-500 font-medium">Analyzing your habits...</p>
    </div>
  );

  if (!data) return null;

  const stats = [
    { label: 'Weekly Minutes', value: data.stats.totalMinutesWeek, icon: Timer, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Weekly Pages', value: data.stats.totalPagesWeek, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Reading Velocity', value: `${data.stats.velocity} p/m`, icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Avg. Session', value: `${data.stats.averageSession}m`, icon: Target, color: 'text-[#14919B]', bg: 'bg-[#14919B]/10' },
  ];

  return (
    <div className="space-y-6">
      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm">
            <div className={`${stat.bg} w-10 h-10 rounded-2xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">{stat.label}</p>
            <p className="text-xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* --- MAIN CHART --- */}
      <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-gray-900">Weekly Activity</h3>
            <p className="text-xs text-gray-500 font-medium">Minutes spent reading per day</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
              <span className="w-3 h-3 rounded-full bg-[#14919B]" /> Minutes
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 900, color: '#14919B' }}
              />
              <Bar 
                dataKey="minutes" 
                fill="#14919B" 
                radius={[6, 6, 6, 6]} 
                barSize={32}
              >
                {data.weeklyData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={Number(entry.minutes) > 0 ? '#14919B' : '#f1f5f9'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- COMPARISON INSIGHT --- */}
      <div className="bg-linear-to-br from-[#14919B] to-[#0e6b72] p-8 rounded-[2.5rem] text-white">
        <h4 className="font-black text-lg mb-2">Reading Velocity Insight ⚡</h4>
        <p className="text-[#e2f7f9] text-sm leading-relaxed max-w-2xl">
          You are currently reading at <span className="text-white font-black">{data.stats.velocity} pages per minute</span>. 
          At this pace, you could finish a standard 300-page book in roughly 
          <span className="text-white font-black"> {Math.round(300 / data.stats.velocity / 60)} hours</span> of focused reading!
        </p>
      </div>
    </div>
  );
}