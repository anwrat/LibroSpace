'use client';

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface Props {
  achievedDates: string[]; 
}

export default function MonthHeatMap({ achievedDates }: Props) {
  const now = new Date();
  const currentRealYear = now.getFullYear();
  const currentRealMonth = now.getMonth();

  // Navigation Filter States
  const [selectedMonth, setSelectedMonth] = useState<number>(currentRealMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentRealYear);

  // Generate lists of days, month string, and setup properties for selected period
  const { daysInMonth, monthName } = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth, 1);
    const days = [];
    
    const name = date.toLocaleString('default', { month: 'long' });

    while (date.getMonth() === selectedMonth) {
      // Format as YYYY-MM-DD local time padding
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      
      days.push(`${yyyy}-${mm}-${dd}`);
      date.setDate(date.getDate() + 1);
    }
    return { daysInMonth: days, monthName: name };
  }, [selectedMonth, selectedYear]);

  // Generate Year Range options (e.g., 3 years in the past up to current year)
  const availableYears = useMemo(() => {
    const years = [];
    for (let i = currentRealYear; i >= currentRealYear - 3; i--) {
      years.push(i);
    }
    return years;
  }, [currentRealYear]);

  const monthNamesList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Quick navigation click controllers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8 font-main text-gray-900">
      
      {/* --- FILTER CONTROL CONSOLE HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#14919B]" />
          <h3 className="font-black text-gray-800 tracking-tight text-lg">
            {monthName} {selectedYear}
          </h3>
        </div>

        {/* Filters Panel Selectors */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Chevron Navigation Controls */}
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1 gap-0.5 mr-2">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-[#14919B] transition-all cursor-pointer active:scale-95"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-[#14919B] transition-all cursor-pointer active:scale-95"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Month Dropdown Menu */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#14919B]/30 focus:border-[#14919B] transition-all cursor-pointer"
          >
            {monthNamesList.map((mName, index) => (
              <option key={mName} value={index}>{mName}</option>
            ))}
          </select>

          {/* Year Dropdown Menu */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#14919B]/30 focus:border-[#14919B] transition-all cursor-pointer"
          >
            {availableYears.map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- GRID DISPLAY MATRIX AREA --- */}
      <div className="flex flex-wrap gap-2">
        {daysInMonth.map((day) => {
          const isAchieved = achievedDates.includes(day);
          
          // Generate Localized Real-Time String Check 
          const todayString = new Date().toLocaleDateString('en-CA'); // Outputs standard matching 'YYYY-MM-DD'
          const isToday = day === todayString;
          
          return (
            <div
              key={day}
              title={day}
              className={`
                w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-300 flex items-center justify-center text-[10px] font-black tracking-tight
                ${isAchieved 
                  ? 'bg-[#14919B] text-white shadow-sm shadow-[#14919B]/20' 
                  : 'bg-gray-50 text-gray-400 border border-gray-100/70 hover:bg-gray-100/60'}
                ${isToday ? 'ring-2 ring-orange-400 ring-offset-2 scale-105 z-10' : ''}
              `}
            >
              {day.split('-')[2]}
            </div>
          );
        })}
      </div>

      {/* --- FOOTER CONTENT LEGEND --- */}
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 font-medium">
        <p>Showing activity logs across specified daily goals profiles.</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#14919B]" />
            <span>Achieved</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-gray-50 border border-gray-100" />
            <span>Unproductive</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded ring-2 ring-orange-400 bg-gray-50" />
            <span>Current Today</span>
          </div>
        </div>
      </footer>
    </div>
  );
}