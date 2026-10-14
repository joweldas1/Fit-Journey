import React, { useEffect, useState, useRef } from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * Leo Entrance Banner — 3 to 5 Second Interactive Situational Scene
 * Displays Leo avatar with contextual guidance based on time-of-day and calorie status.
 */
export default function LeoEntranceBanner({
  scene,
  isOpen,
  onDismiss,
  onAction,
  darkMode = true,
  lang = 'bn'
}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const isPausedRef = useRef(false);

  // Auto-dismiss countdown (4.5 seconds)
  useEffect(() => {
    if (!isOpen || !scene) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setProgress(100);
    isPausedRef.current = false;

    const DURATION = 4500; // 4.5 seconds
    const INTERVAL = 50;
    const step = (INTERVAL / DURATION) * 100;

    const timer = setInterval(() => {
      if (!isPausedRef.current) {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            handleClose();
            return 0;
          }
          return Math.max(0, prev - step);
        });
      }
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [isOpen, scene]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 250);
  };

  const handleActionButton = () => {
    if (onAction && scene) {
      onAction(scene.actionType);
    }
    handleClose();
  };

  if (!isOpen || !scene) return null;

  return (
    <div
      onMouseEnter={() => { isPausedRef.current = true; }}
      onMouseLeave={() => { isPausedRef.current = false; }}
      onTouchStart={() => { isPausedRef.current = true; }}
      onTouchEnd={() => { isPausedRef.current = false; }}
      className={`w-full transition-all duration-300 ease-out transform ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
      }`}
    >
      <div
        className={`relative rounded-2xl p-3 sm:p-3.5 border shadow-xl backdrop-blur-xl overflow-hidden transition-colors ${
          darkMode
            ? 'bg-[#121217]/95 border-[#27272A] text-slate-100 shadow-orange-500/5'
            : 'bg-white/95 border-slate-200/90 text-slate-800 shadow-teal-500/5'
        }`}
      >
        {/* Subtle Ambient Glow framing Leo */}
        <div
          className="absolute -left-6 -top-6 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20"
          style={{ backgroundColor: scene.accentColor || (darkMode ? '#F97316' : '#0D9488') }}
        />

        <div className="flex items-center gap-3 relative z-10">
          
          {/* Leo Avatar with Animated Floating Aura */}
          <div className="relative shrink-0">
            <div
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl overflow-hidden p-0.5 border shadow-md flex items-center justify-center transition-transform ${
                darkMode
                  ? 'border-orange-500/40 bg-gradient-to-b from-[#181820] to-[#09090B] animate-pulse-glow'
                  : 'border-teal-500/40 bg-gradient-to-b from-teal-50 to-white animate-pulse-glow-teal'
              }`}
            >
              <img
                src="/leo.svg"
                alt="Leo"
                className="w-full h-full object-cover object-top animate-float-gentle scale-110"
                onError={(e) => {
                  // Fallback if image fails to render
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Live Status indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-darkBg" />
            </span>
          </div>

          {/* Leo Dialog Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  darkMode
                    ? 'bg-orange-500/10 text-brandOrange border-orange-500/25'
                    : 'bg-teal-500/10 text-teal-700 border-teal-500/25'
                }`}
              >
                {scene.badge}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">• Leo</span>
            </div>

            <p className="text-xs sm:text-[13px] font-semibold leading-snug line-clamp-2">
              {scene.message}
            </p>
          </div>

          {/* Quick Action Button & Dismiss */}
          <div className="flex items-center gap-1.5 shrink-0">
            {scene.actionLabel && (
              <button
                type="button"
                onClick={handleActionButton}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 flex items-center gap-1 cursor-pointer shadow-sm ${
                  darkMode
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-95 shadow-orange-500/20'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:opacity-95 shadow-teal-500/20'
                }`}
              >
                <span>{scene.actionLabel}</span>
                <ArrowRight className="w-3 h-3 stroke-[3]" />
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              aria-label="Dismiss"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-500/10 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4.5s Auto-Countdown Indicator Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-500/10 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${
              darkMode ? 'bg-orange-500/80' : 'bg-teal-500/80'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
