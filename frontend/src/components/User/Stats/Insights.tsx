"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Timer,
  BookOpen,
  Zap,
  Target,
  Loader2,
  Sparkles,
  Award,
  Flame,
  Layers,
  Activity,
} from "lucide-react";
import { getReadingInsights } from "@/lib/user";
import Image from "next/image";

export default function ReadingInsights() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await getReadingInsights();
        setData(res?.data?.data || res?.data);
      } catch (err) {
        console.error("Failed to load insights:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  if (loading)
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 shadow-xs">
        <Loader2 className="animate-spin text-[#14919B] mb-4" size={36} />
        <p className="text-gray-500 font-bold text-sm tracking-wide uppercase">
          Assembling personal metrics...
        </p>
      </div>
    );

  if (!data) return null;

  const weeklyStats = [
    {
      label: "Weekly Minutes",
      value: `${data.stats.totalMinutesWeek}m`,
      icon: Timer,
      color: "text-blue-600",
      bg: "bg-blue-50/70",
    },
    {
      label: "Weekly Pages",
      value: data.stats.totalPagesWeek,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-50/70",
    },
    {
      label: "Reading Velocity",
      value: `${data.stats.velocity} p/m`,
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50/70",
    },
    {
      label: "Avg. Session",
      value: `${data.stats.averageSession}m`,
      icon: Target,
      color: "text-[#14919B]",
      bg: "bg-[#14919B]/10",
    },
  ];

  const hasMilestones =
    data.milestones?.bookMostSessions || data.milestones?.bookLongestSession;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/*ALL-TIME OVERVIEW STATS */}
      {data.totalStats && (
        <section className="space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
              Reading Stats
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-xs flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-0.5">
                  Total Reading Sessions
                </p>
                <p className="text-2xl font-black text-gray-900">
                  {data.totalStats.totalSessions} sessions
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-xs flex items-center gap-4">
              <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <Layers size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-0.5">
                  Total Time Logged
                </p>
                <p className="text-2xl font-black text-gray-900">
                  {data.totalStats.totalMinutes} minutes
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/*WEEKLY INSIGHTS REGION*/}
      <section className="space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-2xl font-black text-gray-900 mt-0.5">
            Weekly Reading Stats
          </h3>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {weeklyStats.map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100/80 p-5 rounded-[2rem] shadow-xs hover:border-gray-200 transition-all flex items-center justify-between"
            >
              <div
                className={`${stat.bg} w-11 h-11 rounded-xl flex items-center justify-center mb-4`}
              >
                <stat.icon
                  size={20}
                  className={stat.color}
                  fill={
                    stat.color === "text-amber-600" ? "currentColor" : "none"
                  }
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1 px-0.5">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --- MAIN CHART --- */}
        <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-[2.5rem] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg font-black text-gray-900">
                Weekly Distribution
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14919B]" /> Session
              Duration
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.weeklyData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 800 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 800 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "1.25rem",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.05)",
                    padding: "12px",
                  }}
                  itemStyle={{
                    fontSize: "12px",
                    fontWeight: 900,
                    color: "#14919B",
                  }}
                  labelStyle={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#94a3b8",
                    marginBottom: "4px",
                  }}
                />
                <Bar
                  dataKey="minutes"
                  fill="#14919B"
                  radius={[8, 8, 8, 8]}
                  barSize={28}
                >
                  {data.weeklyData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={Number(entry.minutes) > 0 ? "#14919B" : "#f1f5f9"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/*ALL-TIME MILESTONES / HISTORICAL SECTION*/}
      {hasMilestones && (
        <section className="space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
              Historical Milestones
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BOOK WITH MOST SESSIONS */}
            {data.milestones.bookMostSessions && (
              <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] flex flex-col sm:flex-row gap-5 items-start shadow-xs">
                <div className="relative h-32 w-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 shadow-md">
                  {data.milestones.bookMostSessions.coverUrl ? (
                    <Image
                      src={data.milestones.bookMostSessions.coverUrl}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <BookOpen size={24} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black text-[#14919B]">
                    Frequently Read Book
                  </h3>
                  <h4 className="font-black text-base text-gray-900 truncate leading-snug">
                    {data.milestones.bookMostSessions.title}
                  </h4>
                  <p className="text-xs font-bold text-gray-400 mt-0.5 truncate">
                    by {data.milestones.bookMostSessions.author}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4 border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-[9px] uppercase font-black tracking-widest text-gray-400">
                        Total Sessions
                      </p>
                      <p className="text-base font-black text-gray-800">
                        {data.milestones.bookMostSessions.sessions}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black tracking-widest text-gray-400">
                        Total Time
                      </p>
                      <p className="text-base font-black text-gray-800">
                        {data.milestones.bookMostSessions.totalMinutes} mins
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LONGEST SINGLE READING SESSION */}
            {data.milestones.bookLongestSession && (
              <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] flex flex-col sm:flex-row gap-5 items-start shadow-xs">
                <div className="relative h-32 w-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 shadow-md">
                  {data.milestones.bookLongestSession.coverUrl ? (
                    <Image
                      src={data.milestones.bookLongestSession.coverUrl}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <BookOpen size={24} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black text-[#14919B]">
                    Longest Session
                  </h3>
                  <h4 className="font-black text-base text-gray-900 truncate leading-snug">
                    {data.milestones.bookLongestSession.title}
                  </h4>
                  <p className="text-xs font-bold text-gray-400 mt-0.5 truncate">
                    by {data.milestones.bookLongestSession.author}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4 border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-[9px] uppercase font-black tracking-widest text-gray-400">
                        Duration
                      </p>
                      <p className="text-base font-black text-gray-800">
                        {data.milestones.bookLongestSession.maxSessionMinutes}{" "}
                        mins
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black tracking-widest text-gray-400">
                        Pages Covered
                      </p>
                      <p className="text-base font-black text-gray-800">
                        {data.milestones.bookLongestSession.totalPagesRead}{" "}
                        pages
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
