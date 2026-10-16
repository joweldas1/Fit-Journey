import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ArrowRight } from 'lucide-react';

/**
 * Leo Entrance Scene — Prominent 3 to 5 Second Interactive Situational Greeting
 * Greets user by time-of-day, asks situational questions, and provides interactive answer buttons.
 */
export default function LeoEntranceBanner({
  scene,
  isOpen,
  onDismiss,
  onAction,
  darkMode = true,
  lang = 'bn'
}) {
  const [visible, setVisible] = useState(Boolean(isOpen && scene));
  const [progress, setProgress] = useState(100);
  const isPausedRef = useRef(false);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 250);
  }, [onDismiss]);

  // Auto-dismiss countdown (8 seconds)
  useEffect(() => {
    if (!isOpen || !scene) {
      return;
    }

    setVisible(true);
    setProgress(100);
    isPausedRef.current = false;

    const DURATION = 8000; // 8.0 seconds comfortable mobile reading
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
  }, [isOpen, scene, handleClose]);

  const handlePrimaryAction = () => {
    if (onAction && scene) {
      onAction(scene.actionType);
    }
    handleClose();
  };

  const handleSecondaryAction = () => {
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
        className={`relative rounded-3xl p-3.5 sm:p-4 border shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300 ${
          darkMode
            ? 'bg-[#121217]/95 border-[#27272A] text-slate-100 shadow-orange-500/10'
            : 'bg-white border-slate-200 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
        }`}
      >
        {/* Soft Ambient Radial Glow */}
        <div
          className="absolute -left-10 -top-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ backgroundColor: scene.accentColor || '#F97316' }}
        />

        <div className="flex items-start gap-3.5 relative z-10">
          
          {/* Leo Animated Mascot Avatar (Prominent Size & Transparent) */}
          <div className="relative shrink-0 self-center sm:self-start pt-0.5">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center transition-all ${
                darkMode
                  ? 'filter drop-shadow-[0_0_18px_rgba(249,115,22,0.5)]'
                  : 'filter drop-shadow-[0_0_16px_rgba(249,115,22,0.4)]'
              }`}
            >
              <img
                src="/leo.svg"
                alt="Leo Mascot"
                className="w-full h-full object-contain animate-float-gentle"
              />
            </div>
          </div>

          {/* Leo Greeting & Question Dialog */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    darkMode
                      ? 'bg-orange-500/15 text-brandOrange border-orange-500/30'
                      : 'bg-orange-500/10 text-orange-700 border-orange-500/25'
                  }`}
                >
                  {scene.badge}
                </span>
                <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'লিও' : 'Leo'}
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close Leo Scene"
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-500/10 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Question Text */}
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
              {scene.title}
            </h4>
            <p className="text-xs sm:text-[12.5px] font-medium text-slate-700 dark:text-slate-300 mt-0.5 leading-snug">
              {scene.message}
            </p>

            {/* Interactive Answer Buttons */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {scene.actionLabel && (
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md bg-gradient-to-r from-brandOrange via-orange-500 to-amber-500 text-white hover:opacity-95 shadow-orange-500/25"
                >
                  <span>{scene.actionLabel}</span>
                  <ArrowRight className="w-3 h-3 stroke-[3]" />
                </button>
              )}

              {scene.secondaryActionLabel && (
                <button
                  type="button"
                  onClick={handleSecondaryAction}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 transition active:scale-95"
                >
                  {scene.secondaryActionLabel}
                </button>
              )}
            </div>

          </div>

        </div>

        {/* 5.0s Auto-Countdown Indicator Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-500/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brandOrange to-amber-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
