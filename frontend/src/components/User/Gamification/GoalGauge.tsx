'use client';

import { useState } from 'react';
import { Settings, CheckCircle2 } from 'lucide-react';
import { updateUserGoal } from '@/lib/user'; 

interface GoalGaugeProps {
  currentSeconds: number;
  goalMinutes: number;
  onGoalUpdate?: (newGoal: number) => void;
}

export default function GoalGauge({ currentSeconds, goalMinutes, onGoalUpdate }: GoalGaugeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goalMinutes);

  const currentMinutes = Math.floor(currentSeconds / 60);
  const progress = Math.min((currentMinutes / goalMinutes) * 100, 100);
  
  // SVG Gauge Math
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference / 2;
  const arcOffset = arcLength - (progress / 100) * arcLength;

  const handleSaveGoal = async () => {
    try {
      await updateUserGoal(tempGoal);
      if (onGoalUpdate) onGoalUpdate(tempGoal);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update goal", err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center w-full max-w-md mx-auto">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Reading Goal</h3>
      
      <div className="relative flex items-center justify-center">
        <svg height={radius * 1.2} width={radius * 2}>
          {/* Background Track */}
          <path
            d={`M 20 ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - 20} ${radius}`}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Progress Bar */}
          <path
            d={`M 20 ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - 20} ${radius}`}
            fill="none"
            stroke={progress >= 100 ? "#f97316" : "#14919B"}
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${arcLength}`}
            style={{ strokeDashoffset: arcOffset, transition: 'stroke-dashoffset 1s ease-out' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Text Overlay */}
        <div className="absolute top-10 flex flex-col items-center">
          <span className="text-3xl font-black text-gray-900">{currentMinutes}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Minutes Read</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-gray-600">
          Target: <span className="text-[#14919B] font-bold">{goalMinutes} mins</span>
        </p>
      </div>

      {/* Action Button */}
      {!isEditing ? (
        <button 
          onClick={() => setIsEditing(true)}
          className="mt-6 flex items-center gap-2 px-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full text-sm font-semibold transition-all"
        >
          <Settings size={16} />
          Adjust Goal
        </button>
      ) : (
        <div className="mt-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <input 
            type="number" 
            value={tempGoal}
            onChange={(e) => setTempGoal(Number(e.target.value))}
            className="w-20 px-3 py-1 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14919B]"
          />
          <button 
            onClick={handleSaveGoal}
            className="p-2 bg-[#14919B] text-white rounded-lg hover:bg-[#0e6b73]"
          >
            <CheckCircle2 size={20} />
          </button>
        </div>
      )}
    </div>
  );
}