import React from 'react';
import { t } from '../utils/translations';

export default function CalorieGauge({ consumed = 0, target = 2400, lang = 'bn' }) {
  const percentage = Math.min(Math.round((consumed / target) * 100), 100);
  const txt = t[lang] || t.bn;

  // Wide graceful arc (Radius: 105)
  const radius = 105;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // ~329.87
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-72 h-40 flex items-end justify-center mx-auto">
      {/* SVG Semi-Circle Arc */}
      <svg 
        viewBox="0 0 260 145" 
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B4A" />
            <stop offset="60%" stopColor="#FFA048" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>

        {/* Background Track Arc */}
        <path
          d="M 25 135 A 105 105 0 0 1 235 135"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-slate-200/80 dark:text-slate-800"
        />

        {/* Dynamic Progress Arc */}
        <path
          d="M 25 135 A 105 105 0 0 1 235 135"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Anchored to Bottom: Ample Breathing Room from Arc Apex */}
      <div className="absolute inset-x-0 bottom-2 flex flex-col items-center justify-end text-center pointer-events-none">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1">
          {txt.dailyProgressTitle}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {consumed}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            / {target} kcal
          </span>
        </div>
        <span className="text-xs font-extrabold text-brandOrange mt-1">
          {percentage}% {txt.complete}
        </span>
      </div>
    </div>
  );
}