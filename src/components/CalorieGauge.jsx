import React from 'react';

export default function CalorieGauge({ consumed = 0, target = 2400 }) {
  const percentage = Math.min(Math.round((consumed / target) * 100), 100);

  // SVG Gauge calculations (Radius: 80, Arc from 180 to 360 deg)
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half circle circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center pt-2 pb-1">
      {/* SVG Semi-Circle */}
      <svg width="220" height="125" viewBox="0 0 200 115" className="overflow-visible">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B4A" />
            <stop offset="60%" stopColor="#FFA048" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>

        {/* Background Track Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-slate-200/80 dark:text-slate-800"
        />

        {/* Dynamic Progress Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Label & Numbers */}
      <div className="absolute top-14 flex flex-col items-center text-center">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          Daily Calorie Progress
        </span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {consumed}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            / {target} kcal
          </span>
        </div>
        <span className="text-[10px] font-bold text-brandOrange mt-0.5">
          {percentage}% Complete
        </span>
      </div>
    </div>
  );
}