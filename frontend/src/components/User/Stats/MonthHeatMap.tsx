'use client';

import { useMemo } from "react";

interface Props {
  achievedDates: string[]; 
}

export default function MonthHeatMap({ achievedDates }: Props) {
  const { daysInMonth, monthName, year } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    const monthName = now.toLocaleString('default', { month: 'long' });

    while (date.getMonth() === month) {
      days.push(new Date(date).toISOString().split('T')[0]);
      date.setDate(date.getDate() + 1);
    }
    return { daysInMonth: days, monthName, year };
  }, []);

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900">{monthName} {year}</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {daysInMonth.map((day) => {
          const isAchieved = achievedDates.includes(day);
          const isToday = day === new Date().toISOString().split('T')[0];
          
          return (
            <div
              key={day}
              title={day}
              className={`
                w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-300 flex items-center justify-center text-[10px] font-medium
                ${isAchieved 
                  ? 'bg-[#14919B] text-white shadow-sm' 
                  : 'bg-gray-50 text-gray-300 border border-gray-100'}
                ${isToday ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
              `}
            >
              {day.split('-')[2]}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-gray-400">
        Showing activity for the current month based on your daily reading goals.
      </p>
    </div>
  );
}